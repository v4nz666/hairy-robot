package main;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Random;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;

public class Server {
  private Random _rand = new Random();
  
  private LinkedList<User> _user = new LinkedList<>();
  private HashMap<SocketIOClient, User> _userMap = new HashMap<>();
  
  private final int x = 100;
  private final int y = 100;
  private final int life = 100;
  private final int shields = 100;
  
  public void start() throws InterruptedException {
    Configuration config = new Configuration();
    config.setHostname("localhost");
    config.setPort(9092);
    
    final SocketIOServer server = new SocketIOServer(config);
    server.addConnectListener(new ConnectListener() {
      @Override
      public void onConnect(SocketIOClient client) {
        addUser(client);
      }
    });
    
    server.addEventListener("msg", Msg.class, new DataListener<Msg>() {
      @Override
      public void onData(SocketIOClient client, Msg data, AckRequest ackSender) {
        server.getBroadcastOperations().sendEvent("msg", data);
      }
    });
    
    server.addEventListener("cmd", User.Cmd.class, new DataListener<User.Cmd>() {
      @Override
      public void onData(SocketIOClient client, User.Cmd data, AckRequest ackSender) {
        addCommand(client, data);
      }
    });
    
    server.start();
    Thread.sleep(Integer.MAX_VALUE);
    server.stop();
  }
  
  private void addUser(SocketIOClient socket) {
    int id = _user.size() + 1;
    User user = new User(id, socket, "User " + id, x, y, life, shields);
    _user.add(user);
    _userMap.put(socket, user);
    
    System.out.println("New user added");
    
    socket.sendEvent("setParams", new User.Params(String.valueOf(id), getColor()));
    socket.sendEvent("msg", new Msg("Server", "Welcome!!"));
  }
  
  private void addCommand(SocketIOClient socket, User.Cmd cmd) {
    User user = _userMap.get(socket);
    user.addCommand(cmd);
  }
  
  private String getColor() {
    return "#" + Integer.toString(_rand.nextInt(0x1000000), 0x10);
  }
}