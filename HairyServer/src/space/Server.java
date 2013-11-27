package space;

import io.netty.util.internal.chmv8.ConcurrentHashMapV8;

import java.io.IOException;
import java.net.BindException;
import java.net.ConnectException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentLinkedDeque;

import space.celestials.StarSystem;
import space.events.CelestialRequest;
import space.events.Disconnect;
import space.events.EntityRequest;
import space.events.Keys;
import space.events.Login;
import space.events.Message;
import space.events.UseShip;
import space.models.Ship;
import space.models.User;
import space.physics.Entity;
import sql.MySQL;
import sql.SQL;

import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.mysql.jdbc.exceptions.jdbc4.MySQLSyntaxErrorException;

public class Server {
  private static Server _instance = new Server();
  public static Server instance() { return _instance; }
  
  private ArrayList<StarSystem> _system;
  
  public final double acc = 1 * 0.0625;
  public final double dec = 0.75 * 0.0625;
  
  private ConcurrentLinkedDeque<User> _user = new ConcurrentLinkedDeque<>();
  private ConcurrentHashMapV8<SocketIOClient, User> _userMap = new ConcurrentHashMapV8<>();
  
  private SocketIOServer _server;
  
  private boolean _running;
  private int _tps = 60;
  
  private SQL _sql;
  
  private Server() { }
  
  public int tps() { return _tps; }
  
  public void start() throws InterruptedException {
    System.out.println("Initialising...");
    
    Runtime.getRuntime().addShutdownHook(new Thread() {
      public void run() {
        System.out.println("Shutting down...");
        System.out.println("Shutting down listening threads...");
        if(_server != null) { _server.stop(); }
        
        System.out.println("Unloading star systems...");
        for(StarSystem system : _system) {
          system.stop();
          
          while(system.isAlive()) {
            try {
              system.join();
            } catch(InterruptedException e) {
              e.printStackTrace();
            }
          }
        }
        
        System.out.println("Disconnecting from SQL server...");
        if(_sql != null) { _sql.close(); }
        
        System.out.println("Goodbye.");
      }
    });
    
    try {
      _sql = SQL.create(MySQL.class);
      _sql.connect("project1.monoxidedesign.com", "hairydata", "hairydata", "WaRcebYmnz4eSnGs");
    } catch(InstantiationException | IllegalAccessException | ClassNotFoundException e) {
      System.err.println("We couldn't load Connector/J.  Make sure the library is there and the build path is configured properly.");
      return;
    } catch(SQLException e) {
      if(e.getCause() instanceof ConnectException) {
        System.err.println("We couldn't connect to the server you specified.  Sorry about that.");
        return;
      } else {
        e.printStackTrace();
      }
      
      return;
    }
    
    try {
      _system = StarSystem.load();
    } catch(SQLException e) {
      if(e instanceof MySQLSyntaxErrorException) {
        System.err.println(e.getLocalizedMessage());
        
        if(e.getMessage().contains("doesn't exist")) {
          System.err.println("Make sure you're up to date on your migrations.");
        }
      } else {
        e.printStackTrace();
      }
      
      return;
    }
    
    Configuration config = new Configuration();
    config.setPort(9092);
    
    _server = new SocketIOServer(config);
    _server.addDisconnectListener(new Disconnect());
    _server.addEventListener("lo", User.Login.class, new Login());
    _server.addEventListener("ms", User.Message.class, new Message());
    _server.addEventListener("us", Ship.Use.class, new UseShip());
    _server.addEventListener("er", Entity.Request.class, new EntityRequest());
    _server.addEventListener("cr", Entity.Request.class, new CelestialRequest());
    _server.addEventListener("ke", Ship.Keys.class, new Keys());
    
    System.out.println("Starting listening thread...");
    
    try {
      _server.start();
    } catch(Exception e) {
      if(e instanceof BindException && e.getMessage().contains("Address already in use")) {
        System.err.println("Sorry, we can't open the server because there is already a server running on the selected port.  " +
        		               "You'll have to either close that program or change the port this server runs on.");
      } else {
        e.printStackTrace();
      }
      
      return;
    }
    
    System.out.println("Server running.");
    
    try {
      System.in.read();
    } catch(IOException e) {
      e.printStackTrace();
    }
    
    System.exit(0);
  }
  
  public void broadcastEvent(String name, Object packet) {
    _server.getBroadcastOperations().sendEvent(name, packet);
  }
  
  public void broadcastMessage(String from, String message) {
    broadcastEvent("ms", new User.Message(from, message));
  }
  
  public User userFromSocket(SocketIOClient socket) {
    return _userMap.get(socket);
  }
  
  public Ship findShip(int systemID, int shipID) {
    for(StarSystem system : _system) {
      if(system.id == systemID) {
        return system.findShip(shipID);
      }
    }
    
    return null;
  }
  
  public void addUser(SocketIOClient socket, User.Login data) {
    try {
      User user = User.getUserIfAuthed(socket, data);
      
      if(user != null) {
        _user.add(user);
        _userMap.put(socket, user);
        
        System.out.println("New user added " + user.id);
        
        user.serializeLoginResponse().send();
      }
    } catch(SQLException e) {
      e.printStackTrace();
    }
  }
  
  public void removeUser(SocketIOClient socket) {
    User user = _userMap.get(socket);
    
    _userMap.remove(socket);
    
    if(user != null) {
      System.out.println("Disconnecting " + user.id);
      
      user.leaveShip();
      _user.remove(user);
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
      
      //tick(timeDelta / interval);
      
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
  
  /*private void tick(double deltaT) {
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
  }*/
}