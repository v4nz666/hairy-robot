package space;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

import space.celestials.StarSystem;
import space.events.Disconnect;
import space.events.Keys;
import space.events.Login;
import space.events.Message;
import space.physics.Sandbox;
import sql.MySQL;
import sql.SQL;

import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;

public class Server {
  private static Server _instance = new Server();
  public static Server instance() { return _instance; }
  
  private ArrayList<StarSystem> _system = new ArrayList<>();
  
  public final double acc = 1 * 0.0625;
  public final double dec = 0.75 * 0.0625;
  
  private ConcurrentLinkedDeque<User> _user = new ConcurrentLinkedDeque<>();
  private HashMap<SocketIOClient, User> _userMap = new HashMap<>();
  
  private SocketIOServer _server;
  private Sandbox _sandbox = new Sandbox();
  
  private boolean _running;
  private int _tps = 60;
  
  private SQL _sql;
  
  private Server() { }
  
  private static int _id;
  public static int getID() { return _id++; }
  
  public int tps() { return _tps; }
  
  public void start() throws InterruptedException, InstantiationException, IllegalAccessException {
    System.out.println("Initialising...");
    
    _sql = SQL.create(MySQL.class);
    _sql.connect("project1.monoxidedesign.com", "hairydata", "hairydata", "WaRcebYmnz4eSnGs");
    
    _system.add(new StarSystem(0));
    
    Configuration config = new Configuration();
    config.setPort(9092);
    
    _server = new SocketIOServer(config);
    _server.addDisconnectListener(new Disconnect());
    _server.addEventListener("login", User.Login.class, new Login());
    _server.addEventListener("msg", Ship.Message.class, new Message());
    _server.addEventListener("keys", Ship.Keys.class, new Keys());
    
    System.out.println("Starting listening thread...");
    
    _server.start();
    _sandbox.startSandbox();
    
    System.out.println("Server running.");
    
    gameLoop();
    
    _sandbox.stopSandbox();
    _server.stop();
    _sql.close();
  }
  
  public void broadcastEvent(String name, Object packet) {
    _server.getBroadcastOperations().sendEvent(name, packet);
  }
  
  public User userFromSocket(SocketIOClient socket) {
    return _userMap.get(socket);
  }
  
  public void addUser(SocketIOClient socket, User.Login data) {
    User user = null;
    
    try {
      user = User.getUserIfAuthed(socket, data);
    } catch(SQLException e) {
      e.printStackTrace();
      return;
    }
    
    _user.add(user);
    _userMap.put(socket, user);
    _sandbox.addToSandbox(user);
    
    System.out.println("New user added " + user.id);
    
    socket.sendEvent("setParams", user.serializeParams());
    socket.sendEvent("setSystem", user.serializeSystem());
  }
  
  public void removeUser(SocketIOClient socket) {
    User user = _userMap.get(socket);
    
    _userMap.remove(socket);
    
    if(user != null) {
      System.out.println("Disconnecting " + user.id);
      broadcastEvent("remuser", user.serializeRemove());
      
      _sandbox.removeFromSandbox(user);
      _user.remove(user);
      
      try {
        user.save();
      } catch(SQLException e) {
        e.printStackTrace();
      }
    }
  }
  
  private void gameLoop() throws InterruptedException {
    int interval = 1000000000 / 60;
    _running = true;
    
    long time, timeDelta = interval;
    int ticks = 0;
    long tickTime = System.nanoTime() + 1000000000;
    while(_running) {
      time = System.nanoTime();
      
      tick(timeDelta / interval);
      
      // Track FPS
      if(tickTime <= System.nanoTime()) {
        _tps = ticks;
        ticks = 0;
        tickTime = System.nanoTime() + 1000000000;
        //System.out.println(_tps + " ticks per second");
      }
      
      ticks++;
      
      // Sleep each loop if we have extra time
      timeDelta = System.nanoTime() - time;
      long timeSleep = interval - timeDelta;
      long timeDeltaMS = timeSleep / 1000000;
      int timeDeltaNS = (int)(timeSleep - timeDeltaMS * 1000000);
      if(timeSleep > 0) {
        Thread.sleep(timeDeltaMS, timeDeltaNS);
      }
    }
  }
  
  private void tick(double deltaT) {
    User.Update[] update = new User.Update[_user.size()];
    
    int i = 0;
    for(User user : _user) {
      update[i++] = user.serializeUpdate();
    }
    
    broadcastEvent("update", new Update(update));
  }
  
  public static class Update {
    public final User.Update[] usersOnScreen;
    
    public Update(User.Update[] usersOnScreen) {
      this.usersOnScreen = usersOnScreen;
    }
  }

  public StarSystem system(int index) {
    return _system.get(index);
  }
}