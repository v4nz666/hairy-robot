package http;

import static io.netty.handler.codec.http.HttpHeaders.isKeepAlive;
import static io.netty.handler.codec.http.HttpHeaders.setContentLength;
import static io.netty.handler.codec.http.HttpHeaders.Names.*;
import static io.netty.handler.codec.http.HttpMethod.GET;
import static io.netty.handler.codec.http.HttpResponseStatus.*;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.RandomAccessFile;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.regex.Pattern;

import javax.activation.MimetypesFileTypeMap;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.ChannelProgressiveFuture;
import io.netty.channel.ChannelProgressiveFutureListener;
import io.netty.channel.DefaultFileRegion;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.DefaultHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpResponse;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.LastHttpContent;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import io.netty.handler.codec.http.websocketx.ContinuationWebSocketFrame;
import io.netty.handler.codec.http.websocketx.PingWebSocketFrame;
import io.netty.handler.codec.http.websocketx.PongWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketServerHandshaker;
import io.netty.handler.codec.http.websocketx.WebSocketServerHandshakerFactory;
import io.netty.handler.stream.ChunkedFile;
import io.netty.handler.stream.ChunkedWriteHandler;
import io.netty.util.CharsetUtil;

public class HTTPServer {
  private EventLoopGroup  _eventLoopListen;
  private EventLoopGroup  _eventLoopSocket;
  private ServerBootstrap _bootstrap;
  
  private ChannelFutureListener _futureBind;
  private ChannelFutureListener _futureClose;
  
  public void setFutureBind (ChannelFutureListener future) { _futureBind  = future; }
  public void setFutureClose(ChannelFutureListener future) { _futureClose = future; }
  public void setPort(int port) { _bootstrap.localAddress(port); }
  
  /**
   * <p>Initialise the server.</p>
   * <p>The server <b>must</b> be initialised before
   * attempting to use any socket functions.</p>
   */
  public void init() {
    // Create the worker threads for the listener clients
    _eventLoopListen = new NioEventLoopGroup();
    _eventLoopSocket = new NioEventLoopGroup();
    
    try {
      // Create and set up the bootstrap (listener, etc)
      _bootstrap = new ServerBootstrap()
                .group(_eventLoopListen, _eventLoopSocket)
                .channel(NioServerSocketChannel.class)
                .childHandler(new Initialiser());
    } catch(Exception e) {
      e.printStackTrace();
    }
  }
  
  /**
   * <p>Binds the server to the specified port.</p>
   * <p>If a bind future was provided, it will be
   * notified once the binding is complete.
   * Otherwise, the operation will block
   * until the binding is complete.</p>
   * <p>If a close future was provided, it will be
   * notified when the bound socket is closed.</p>
   * <p>The server <b>must</b> be initialised before binding.</p>
   */
  public void bind() {
    ChannelFuture future = _bootstrap.bind();
    
    if(_futureBind != null) {
      // Register the provided future
      future.addListener(_futureBind);
    } else {
      // Block until op completes
      future.syncUninterruptibly();
    }
    
    if(_futureClose != null) {
      // Register the provided future
      future.channel().closeFuture().addListener(_futureClose);
    }
    
    // Add our own listener to clean up when the listening socket closes
    future.channel().closeFuture().addListener(new ChannelFutureListener() {
      @Override
      public void operationComplete(ChannelFuture future) throws Exception {
        cleanup();
      }
    });
  }
  
  /**
   * <p>Gracefully shuts down the listening
   * socket and all client sockets.</p>
   */
  private void cleanup() {
    _eventLoopListen.shutdownGracefully();
    _eventLoopSocket.shutdownGracefully();
  }
  
  private class Initialiser extends ChannelInitializer<SocketChannel> {
    @Override
    protected void initChannel(SocketChannel ch) throws Exception {
      // Create a default pipeline implementation.
      ChannelPipeline p = ch.pipeline();
      
      // Set up the pipeline with all of our shenanigans
      p.addLast("codec", new HttpServerCodec());
      p.addLast("aggregator", new HttpObjectAggregator(65536));
      p.addLast("chunkedWriter", new ChunkedWriteHandler());
      //p.addLast("deflater", new HttpContentCompressor());
      p.addLast("handler", new Handler(true)); // False for SSL
    }
  }
  
  private class Handler extends SimpleChannelInboundHandler<Object> {
    public static final String HTTP_DATE_FORMAT = "EEE, dd MMM yyyy HH:mm:ss zzz";
    public static final String HTTP_DATE_GMT_TIMEZONE = "GMT";
    public static final int HTTP_CACHE_SECONDS = 60;
    
    private final boolean useSendFile;
    
    private WebSocketServerHandshaker handshaker;
    private MimetypesFileTypeMap mimeTypesMap = new MimetypesFileTypeMap();
    
    public Handler(boolean useSendFile) {
      this.useSendFile = useSendFile;
      
      mimeTypesMap.addMimeTypes("text/html htm html");
      mimeTypesMap.addMimeTypes("application/javascript js");
    }
    
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
      cause.printStackTrace();
      ctx.close();
    }
    
    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
      ctx.flush();
    }
    
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
      if(msg instanceof FullHttpRequest) { handleHTTPRequest   (ctx, (FullHttpRequest)msg); return; }
      if(msg instanceof WebSocketFrame)  { handleWebSocketFrame(ctx, (WebSocketFrame) msg); return; }
    }
    
    private void handleHTTPRequest(ChannelHandlerContext ctx, FullHttpRequest request) throws Exception {
      if(!request.getDecoderResult().isSuccess()) { sendError(ctx, BAD_REQUEST); return; }
      
      /*for(Map.Entry<String, String> header : request.headers()) {
        System.out.println(header.getKey() + ": " + header.getValue());
      }*/
      
      if(!request.headers().contains(UPGRADE)) {
        if(request.getMethod() != GET)              { sendError(ctx, METHOD_NOT_ALLOWED); return; }
        
        String uri = request.getUri();
        String path = sanitizeUri(uri);
        
        if(path == null)                            { sendError(ctx, FORBIDDEN); return; }
        
        //TODO: Don't use absolute path
        File file = new File("www" + path);
        System.out.println("File: " + path);
        System.out.println("Exists: " + file.exists());
        System.out.println("Hidden: " + file.isHidden());
        
        if(!path.startsWith("/socket.io/")) {
          if(file.isHidden() || !file.exists())       { sendError(ctx, NOT_FOUND); return; }
          
          if(file.isDirectory()) {
            if(uri.endsWith("/")) {
              sendListing(ctx, file);
            } else {
              sendRedirect(ctx, uri + '/');
            }
            
            return;
          }
          
          if(!file.isFile())                          { sendError(ctx, FORBIDDEN); return; }
          
          /*// Cache Validation
          String ifModifiedSince = request.headers().get(IF_MODIFIED_SINCE);
          if(ifModifiedSince != null && !ifModifiedSince.isEmpty()) {
            SimpleDateFormat dateFormatter = new SimpleDateFormat(HTTP_DATE_FORMAT, Locale.US);
            Date ifModifiedSinceDate = dateFormatter.parse(ifModifiedSince);
            
            // Only compare up to the second because the datetime format we send to the client
            // does not have milliseconds
            long ifModifiedSinceDateSeconds = ifModifiedSinceDate.getTime() / 1000;
            long fileLastModifiedSeconds = file.lastModified() / 1000;
            if(ifModifiedSinceDateSeconds == fileLastModifiedSeconds) {
              sendNotModified(ctx);
              return;
            }
          }*/
          
          RandomAccessFile raf;
          try {
            raf = new RandomAccessFile(file, "r");
          } catch(FileNotFoundException fnfe) {
            sendError(ctx, NOT_FOUND);
            return;
          }
          long fileLength = raf.length();
          
          HttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);
          setContentLength(response, fileLength);
          setContentTypeHeader(response, file);
          setDateAndCacheHeaders(response, file);
          
          if(isKeepAlive(request)) {
            response.headers().set(CONNECTION, HttpHeaders.Values.KEEP_ALIVE);
          }
          
          // Write the initial line and the header.
          ctx.write(response);
          
          // Write the content.
          ChannelFuture sendFileFuture;
          if(!useSendFile) { sendFileFuture = ctx.write(new ChunkedFile(raf, 0, fileLength, 8192), ctx.newProgressivePromise()); }
          else             { sendFileFuture = ctx.write(new DefaultFileRegion(raf.getChannel(), 0, fileLength), ctx.newProgressivePromise()); }
          
          sendFileFuture.addListener(new ChannelProgressiveFutureListener() {
            @Override
            public void operationProgressed(ChannelProgressiveFuture future, long progress, long total) {
              if(total < 0) { // total unknown
                System.err.println("Transfer progress: " + progress);
              } else {
                System.err.println("Transfer progress: " + progress + " / " + total);
              }
            }
            
            @Override
            public void operationComplete(ChannelProgressiveFuture future) throws Exception {
              System.err.println("Transfer complete.");
            }
          });
          
          // Write the end marker
          ChannelFuture lastContentFuture = ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
          
          // Decide whether to close the connection or not.
          if(!isKeepAlive(request)) {
            // Close the connection when the whole content is written out.
            lastContentFuture.addListener(ChannelFutureListener.CLOSE);
          }
        } else {
          System.out.println("Type: socket.io");
          sendOk(ctx);
        }
      } else {
        // Handshake
        WebSocketServerHandshakerFactory wsFactory = new WebSocketServerHandshakerFactory(getWebSocketLocation(request), null, false, Integer.MAX_VALUE);
        
        if((handshaker = wsFactory.newHandshaker(request)) == null) {
          WebSocketServerHandshakerFactory.sendUnsupportedWebSocketVersionResponse(ctx.channel());
        } else {
          handshaker.handshake(ctx.channel(), request);
        }
        
        request.release();
      }
    }
    
    private void handleWebSocketFrame(ChannelHandlerContext ctx, WebSocketFrame frame) {
      System.out.println(frame.toString());
      
      if(frame instanceof CloseWebSocketFrame) {
        handshaker.close(ctx.channel(), (CloseWebSocketFrame)frame);
      } else if(frame instanceof PingWebSocketFrame) {
        ctx.write(new PongWebSocketFrame(frame.isFinalFragment(), frame.rsv(), frame.content()));
      } else if(frame instanceof TextWebSocketFrame) {
        ctx.write(frame);
      } else if(frame instanceof BinaryWebSocketFrame) {
        ctx.write(frame);
      } else if(frame instanceof ContinuationWebSocketFrame) {
        ctx.write(frame);
      } else if(frame instanceof PongWebSocketFrame) {
        frame.release();
        // Ignore
      } else {
        throw new UnsupportedOperationException(String.format("%s frame types not supported", frame.getClass().getName()));
      }
    }
    
    private final Pattern INSECURE_URI = Pattern.compile(".*[<>&\"].*");
    
    private String sanitizeUri(String uri) {
      // Decode the path.
      try {
        uri = URLDecoder.decode(uri, "UTF-8");
      } catch(UnsupportedEncodingException e) {
        try {
          uri = URLDecoder.decode(uri, "ISO-8859-1");
        } catch(UnsupportedEncodingException e1) {
          throw new Error();
        }
      }
      
      if(!uri.startsWith("/")) {
        return null;
      }
      
      // Convert file separators.
      uri = uri.replace("\\", "/");
      
      // Simplistic dumb security check.
      // You will have to do something serious in the production environment.
      if(uri.contains("/.") ||
         uri.contains("./") ||
         uri.startsWith(".") || uri.endsWith(".") ||
         INSECURE_URI.matcher(uri).matches()) {
        return null;
      }
      
      // Convert to absolute path.
      return uri;
    }
    
    private final Pattern ALLOWED_FILE_NAME = Pattern.compile("[A-Za-z0-9][-_A-Za-z0-9\\.]*");
    
    private void sendListing(ChannelHandlerContext ctx, File dir) {
      FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, OK);
      response.headers().set(CONTENT_TYPE, "text/html; charset=UTF-8");
      
      StringBuilder buf = new StringBuilder();
      String dirPath = dir.getPath();
      
      buf.append("<!DOCTYPE html>\r\n");
      buf.append("<html><head><title>");
      buf.append("Listing of: ");
      buf.append(dirPath);
      buf.append("</title></head><body>\r\n");
      
      buf.append("<h3>Listing of: ");
      buf.append(dirPath);
      buf.append("</h3>\r\n");
      
      buf.append("<ul>");
      buf.append("<li><a href=\"../\">..</a></li>\r\n");
      
      for(File f : dir.listFiles()) {
        if(f.isHidden() || !f.canRead()) {
          continue;
        }
        
        String name = f.getName();
        if(!ALLOWED_FILE_NAME.matcher(name).matches()) {
          continue;
        }
        
        buf.append("<li><a href=\"");
        buf.append(name);
        buf.append("\">");
        buf.append(name);
        buf.append("</a></li>\r\n");
      }
      
      buf.append("</ul></body></html>\r\n");
      ByteBuf buffer = Unpooled.copiedBuffer(buf, CharsetUtil.UTF_8);
      response.content().writeBytes(buffer);
      buffer.release();
      
      // Close the connection as soon as the error message is sent.
      ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }
    
    private void sendRedirect(ChannelHandlerContext ctx, String newUri) {
      FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, FOUND);
      response.headers().set(LOCATION, newUri);
      
      // Close the connection as soon as the error message is sent.
      ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }
    
    private void sendOk(ChannelHandlerContext ctx) {
      FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, OK, Unpooled.copiedBuffer("Welcome to socket.io.", CharsetUtil.UTF_8));
      response.headers().set(CONTENT_TYPE, "text/plain; charset=UTF-8");
      
      // Close the connection as soon as the error message is sent.
      ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }
    
    private void sendError(ChannelHandlerContext ctx, HttpResponseStatus status) {
      FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, status, Unpooled.copiedBuffer("Failure: " + status.toString() + "\r\n", CharsetUtil.UTF_8));
      response.headers().set(CONTENT_TYPE, "text/plain; charset=UTF-8");
      
      // Close the connection as soon as the error message is sent.
      ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }
    
    /**
     * When file timestamp is the same as what the browser is sending up, send a "304 Not Modified"
     *
     * @param ctx
     *            Context
     */
    private void sendNotModified(ChannelHandlerContext ctx) {
      FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, NOT_MODIFIED);
      setDateHeader(response);
      
      // Close the connection as soon as the error message is sent.
      ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }
    
    /**
     * Sets the Date header for the HTTP response
     *
     * @param response
     *            HTTP response
     */
    private void setDateHeader(FullHttpResponse response) {
      SimpleDateFormat dateFormatter = new SimpleDateFormat(HTTP_DATE_FORMAT, Locale.US);
      dateFormatter.setTimeZone(TimeZone.getTimeZone(HTTP_DATE_GMT_TIMEZONE));
      
      Calendar time = new GregorianCalendar();
      response.headers().set(DATE, dateFormatter.format(time.getTime()));
    }
    
    /**
     * Sets the Date and Cache headers for the HTTP Response
     *
     * @param response
     *            HTTP response
     * @param fileToCache
     *            file to extract content type
     */
    private void setDateAndCacheHeaders(HttpResponse response, File fileToCache) {
      SimpleDateFormat dateFormatter = new SimpleDateFormat(HTTP_DATE_FORMAT, Locale.US);
      dateFormatter.setTimeZone(TimeZone.getTimeZone(HTTP_DATE_GMT_TIMEZONE));
      
      // Date header
      Calendar time = new GregorianCalendar();
      response.headers().set(DATE, dateFormatter.format(time.getTime()));
      
      // Add cache headers
      time.add(Calendar.SECOND, HTTP_CACHE_SECONDS);
      response.headers().set(EXPIRES, dateFormatter.format(time.getTime()));
      response.headers().set(CACHE_CONTROL, "private, max-age=" + HTTP_CACHE_SECONDS);
      response.headers().set(LAST_MODIFIED, dateFormatter.format(new Date(fileToCache.lastModified())));
    }
    
    /**
     * Sets the content type header for the HTTP Response
     *
     * @param response
     *            HTTP response
     * @param file
     *            file to extract content type
     */
    private void setContentTypeHeader(HttpResponse response, File file) {
      response.headers().set(CONTENT_TYPE, mimeTypesMap.getContentType(file.getPath()));
    }
    
    private String getWebSocketLocation(FullHttpRequest req) {
      return "ws://" + req.headers().get(HttpHeaders.Names.HOST);
    }
  }
}