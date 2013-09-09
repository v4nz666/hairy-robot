package main;

import util.LoggerFactory;

public class Main {
  public static void main(String[] args) throws InterruptedException {
    System.out.println("Starting");
    
    /*HTTPServer http = new HTTPServer();
    
    http.setFutureBind(new ChannelFutureListener() {
      @Override
      public void operationComplete(ChannelFuture future) throws Exception {
        if(future.isSuccess()) {
          System.out.println("Bound");
        } else {
          System.out.println("Bind failed");
        }
      }
    });
    
    http.setFutureClose(new ChannelFutureListener() {
      @Override
      public void operationComplete(ChannelFuture future) throws Exception {
        System.out.println("Closed");
      }
    });
    
    http.init();
    http.setPort(80);
    http.bind();*/
    
    /*Configuration config = new Configuration();
    config.setHostname("localhost");
    config.setPort(9092);

    final SocketIOServer server = new SocketIOServer(config);
    server.addEventListener("chatevent", ChatObject.class, new DataListener<ChatObject>() {
        @Override
        public void onData(SocketIOClient client, ChatObject data, AckRequest ackRequest) {
            server.getBroadcastOperations().sendEvent("chatevent", data);
        }
    });

    server.start();

    Thread.sleep(Integer.MAX_VALUE);

    server.stop();*/
    
    LoggerFactory.getLogger().enableInfo = false;
    LoggerFactory.getLogger().enableTrace = false;
    Server.instance().start();
  }
}