package main;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

import space.celestials.StarSystem;
import space.game.Bullet;
import space.physics.Sandbox;
import sql.MySQL;
import sql.SQL;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;

public class Server {
  private static Server _instance = new Server();
  public static Server instance() { return _instance; }
  
  public static StarSystem star_system = new StarSystem();
  
  public static final int spread = 15;
  public static final int bulletSize = 1;
  public final double acc = 1 * 0.0625;
  public final double dec = 0.75 * 0.0625;
  
  private ConcurrentLinkedDeque<User> _user = new ConcurrentLinkedDeque<>();
  private HashMap<SocketIOClient, User> _userMap = new HashMap<>();
  private ConcurrentLinkedDeque<Bullet> _bullet = new ConcurrentLinkedDeque<>();
  
  private SocketIOServer _server;
  private Sandbox _sandbox = new Sandbox();
  
  private boolean _running;
  private long _interval;
  private int _ticksPerSecond = 60;
  private int _tps = 60;
  
  private SQL _sql;
  
  private Server() { }
  
  private static int _id;
  public static int getID() { return _id++; }
  
  public void start() throws InterruptedException, InstantiationException, IllegalAccessException {
    System.out.println("Initialising...");
    
    _sql = SQL.create(MySQL.class);
    _sql.connect("project1.monoxidedesign.com", "hairydata", "hairydata", "WaRcebYmnz4eSnGs");
    
    Configuration config = new Configuration();
    config.setPort(9092);
    
    _server = new SocketIOServer(config);
    _server.addDisconnectListener(new DisconnectListener() {
      @Override
      public void onDisconnect(SocketIOClient client) {
        removeUser(client);
      }
    });
    
    _server.addEventListener("login", User.Login.class, new DataListener<User.Login>() {
      @Override
      public void onData(SocketIOClient client, User.Login data, AckRequest ackSender) {
        addUser(client, data.name, data.auth);
      }
    });
    
    _server.addEventListener("msg", Msg.class, new DataListener<Msg>() {
      @Override
      public void onData(SocketIOClient client, Msg data, AckRequest ackSender) {
        // Temporary chat commands
        if(data.msg.startsWith("/")) {
          User user = _userMap.get(client);
          String[] msg = data.msg.split(" ");
          switch(msg[0]) {
            case "/warp":
              try {
                double x = Double.parseDouble(msg[1]);
                double y = Double.parseDouble(msg[2]);
                user.x = Math.min(Math.max(x, 0), star_system.getSize());
                user.y = Math.min(Math.max(y, 0), star_system.getSize());
              } catch(Exception ex) {
                client.sendEvent("msg", new Msg("Server", "Usage: warp x y"));
              }
              
              return;
              
            case "/gun":
              user.setGun(space.data.guns.Gun.getGunRandom());
              _server.getBroadcastOperations().sendEvent("stats", user.serializeStats());
              return;
          }
        }
        
        _server.getBroadcastOperations().sendEvent("msg", new Msg(_userMap.get(client).name, data.msg));
      }
    });
    
    _server.addEventListener("keys", User.Keys.class, new DataListener<User.Keys>() {
      @Override
      public void onData(SocketIOClient client, User.Keys data, AckRequest ackSender) {
        _userMap.get(client).handleInput(data.keys);
      }
    });
    
    System.out.println("Starting listening thread...");
    
    space.data.guns.Gun.init();
    
    _server.start();
    _sandbox.startSandbox();
    _sandbox.trackCollision(User.class, Bullet.class, new Sandbox.CollisionCallback<User, Bullet>() {
      @Override
      public void hit(User entity, Bullet hitBy) {
        userHit(entity, hitBy);
      }
    });
    
    System.out.println("Server running.");
    
    _interval = 1000000000 / _ticksPerSecond;
    _running = true;
    
    long time, timeDelta = _interval;
    int ticks = 0;
    long tickTime = System.nanoTime() + 1000000000;
    while(_running) {
      time = System.nanoTime();
      
      tick(timeDelta / _interval);
      
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
      long timeSleep = _interval - timeDelta;
      long timeDeltaMS = timeSleep / 1000000;
      int timeDeltaNS = (int)(timeSleep - timeDeltaMS * 1000000);
      if(timeSleep > 0) {
        Thread.sleep(timeDeltaMS, timeDeltaNS);
      }
    }
    
    _sandbox.stopSandbox();
    _server.stop();
    _sql.close();
  }
  
  private void addUser(SocketIOClient socket, String name, String auth) {
    User user = null;
    
    try {
      user = User.getUserIfAuthed(socket, name, auth);
    } catch(SQLException e) {
      e.printStackTrace();
      return;
    }
    
    for(User u : _user) {
      socket.sendEvent("adduser", u.serializeAdd());
    }
    
    _server.getBroadcastOperations().sendEvent("adduser", user.serializeAdd());
    
    _user.add(user);
    _userMap.put(socket, user);
    _sandbox.addToSandbox(user);
    
    System.out.println("New user added " + user.id);
    socket.sendEvent("setParams", user.serializeParams());
  }
  
  private void removeUser(SocketIOClient socket) {
    User user = _userMap.get(socket);
    
    _userMap.remove(socket);
    
    if(user != null) {
      System.out.println("Disconnecting " + user.id);
      _server.getBroadcastOperations().sendEvent("remuser", user.serializeRemove());
      
      _sandbox.removeFromSandbox(user);
      _user.remove(user);
      
      try {
        user.save();
      } catch(SQLException e) {
        e.printStackTrace();
      }
    }
  }
  
  private void killUser(User victim) {
    victim.life = victim.maxLife;
    victim.shields = victim.maxShields;
    victim.setGun(space.data.guns.Gun.getGunDefault());
    victim.x = star_system.getSize() / 2;
    victim.y = star_system.getSize() / 2;
    victim.vx = 0;
    victim.vy = 0;
    victim.angle = 0;
    victim.deaths++;
    
    _server.getBroadcastOperations().sendEvent("stats", victim.serializeStats());
  }
  
  public void addBullet(Bullet bullet) {
    _bullet.push(bullet);
    _server.getBroadcastOperations().sendEvent("badd", bullet.serializeForAdd());
    _sandbox.addToSandbox(bullet);
  }
  
  public void removeBullet(Bullet bullet) {
    _sandbox.removeFromSandbox(bullet);
    _bullet.remove(bullet);
    _server.getBroadcastOperations().sendEvent("brem", bullet.serializeForRem());
  }
  
  private void tick(double deltaT) {
    User.Update[] update = new User.Update[_user.size()];
    
    int i = 0;
    for(User user : _user) {
      update[i++] = user.serializeUpdate();
    }
    
    _server.getBroadcastOperations().sendEvent("update", new Update(update));
  }
  
  private void userHit(User user, Bullet bullet) {
    if(user.shields > 0) {
      user.shields = Math.max(0, user.shields - bullet.damage);
    } else {
      user.life -= bullet.damage;
    }
    
    if(user.life > 0) {
      _server.getBroadcastOperations().sendEvent("stats", user.serializeStats());
      _server.getBroadcastOperations().sendEvent("hit", user.serializeHit(bullet));
    } else {
      _server.getBroadcastOperations().sendEvent("kill", user.serializeKill());
      
      User attacker = bullet.user();
      
      killUser(user);
      attacker.kills++;
      
      _server.getBroadcastOperations().sendEvent("msg", new Msg("Server", user.name + " was killed by " + attacker.name));
    }
    
    removeBullet(bullet);
  }
  
  public static class Update {
    public final User.Update[] usersOnScreen;
    
    public Update(User.Update[] usersOnScreen) {
      this.usersOnScreen = usersOnScreen;
    }
  }

  public static StarSystem getCurrentSystem(User user) {
    return star_system;
  }
}