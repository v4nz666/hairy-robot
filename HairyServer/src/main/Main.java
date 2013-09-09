package main;

import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import http.HTTPServer;

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
    
    Server server = new Server();
    server.start();
  }
  
  public static class ChatObject {

    private String userName;
    private String message;

    public ChatObject() {
    }

    public ChatObject(String userName, String message) {
        super();
        this.userName = userName;
        this.message = message;
    }

    public String getUserName() {
        return userName;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

}
}