package main;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Random;
import java.util.concurrent.ConcurrentLinkedDeque;

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
  
  public static final int W = 800, H = 600;
  public static final int spread = 15;
  public static final int bulletSize = 2;
  public static final int maxPowerups = 3;
  public final double acc = 1 * 0.0625;
  public final double dec = 0.75 * 0.0625;
  
  private Random _rand = new Random();
  
  private ConcurrentLinkedDeque<User> _user = new ConcurrentLinkedDeque<>();
  private HashMap<SocketIOClient, User> _userMap = new HashMap<>();
  private ConcurrentLinkedDeque<Bullet> _bullet = new ConcurrentLinkedDeque<>();
  private ConcurrentLinkedDeque<Powerup> _powerup = new ConcurrentLinkedDeque<>();
  private Powerup[] _powerupConv = new Powerup[0];
  
  private SocketIOServer _server;
  private Sandbox _sandbox = new Sandbox();
  
  private boolean _running;
  private long _interval;
  private int _ticksPerSecond = 60;
  private long _ticksTotal;
  private int _tps = 60;
  
  private long _powerupTimer;
  
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
    _sandbox.trackCollision(User.class, Bullet.class, new Sandbox.CollisionCallback() {
      @Override
      public void hit(Entity entity, Entity hitBy) {
        userHit((User)entity, (Bullet)hitBy);
      }
    });
    
    _sandbox.trackCollision(User.class, Powerup.class, new Sandbox.CollisionCallback() {
      @Override
      public void hit(Entity entity, Entity hitBy) {
        userPowerup((User)entity, (Powerup)hitBy);
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
        System.out.println(_tps + " ticks per second");
      }
      
      ticks++;
      _ticksTotal++;
      
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
    
    _user.add(user);
    _userMap.put(socket, user);
    _sandbox.addToSandbox(user);
    
    _server.getBroadcastOperations().sendEvent("adduser", user.serializeAdd());
    
    System.out.println("New user added");
    socket.sendEvent("setParams", user.serializeParams());
    socket.sendEvent("powerups", _powerup.toArray(_powerupConv));
    //TODO: Need to send scores here?
  }
  
  private void removeUser(SocketIOClient socket) {
    User user = _userMap.get(socket);
    
    System.out.println("Disconnecting " + user.id);
    _sandbox.removeFromSandbox(user);
    _user.remove(user);
    _userMap.remove(socket);
    _server.getBroadcastOperations().sendEvent("remuser", user.serializeRemove());
    
    try {
      user.save();
    } catch(SQLException e) {
      e.printStackTrace();
    }
  }
  
  private void killUser(User victim) {
    victim.life = victim.maxLife;
    victim.shields = victim.maxShields;
    victim.setGun(space.data.guns.Gun.getGunDefault());
    victim.x = W / 2;
    victim.y = H / 2;
    victim.vx = 0;
    victim.vy = 0;
    victim.angle = 0;
    victim.deaths++;
    
    _server.getBroadcastOperations().sendEvent("stats", victim.serializeStats());
  }
  
  public void addBullet(Bullet bullet) {
    _bullet.push(bullet);
    _sandbox.addToSandbox(bullet);
  }
  
  public void removeBullet(Bullet bullet) {
    _sandbox.removeFromSandbox(bullet);
    _bullet.remove(bullet);
  }
  
  public void addPowerup() {
    Powerup p = Powerup.random(_rand.nextInt(W), _rand.nextInt(H));
    _powerup.push(p);
    _sandbox.addToSandbox(p);
    _server.getBroadcastOperations().sendEvent("powerups", _powerup.toArray(_powerupConv));
  }
  
  public void removePowerup(Powerup p) {
    _sandbox.removeFromSandbox(p);
    _powerup.remove(p);
  }
  
  private void tick(double deltaT) {
    User.Update[] update = new User.Update[_user.size()];
    
    int i = 0;
    for(User user : _user) {
      update[i++] = user.serializeUpdate();
    }
    
    if(_powerupTimer <= System.nanoTime()) {
      _powerupTimer = System.nanoTime() + (_rand.nextInt(5) + 10) * 1000000000l; // 5-15 seconds
      if(_powerup.size() < maxPowerups) {
        addPowerup();
      }
    }
    
    _server.getBroadcastOperations().sendEvent("update", new Update(_ticksTotal, update, _bullet));
  }
  
  private void userHit(User user, Bullet bullet) {
    String size;
    
    if(user.shields > 0) {
      size = "small";
      user.shields = Math.max(0, user.shields - bullet.damage);
    } else {
      size = "medium";
      user.life -= bullet.damage;
    }
    
    removeBullet(bullet);
    
    if(user.life > 0) {
      _server.getBroadcastOperations().sendEvent("stats", user.serializeStats());
    } else {
      User attacker = bullet.user();
      
      killUser(user);
      attacker.kills++;
      size = "huge";
      //TODO: User scores
      
      _server.getBroadcastOperations().sendEvent("msg", new Msg("Server", user.name + " was killed by " + attacker.name));
    }
    
    _server.getBroadcastOperations().sendEvent("explosion", new Explosion(size, (int)bullet.x, (int)bullet.y, _ticksTotal));
  }
  
  private void userPowerup(User user, Powerup powerup) {
    powerup.use(user);
    removePowerup(powerup);
    _server.getBroadcastOperations().sendEvent("stats", user.serializeStats());
    _server.getBroadcastOperations().sendEvent("powerups", _powerup.toArray(_powerupConv));  }
  
  public static class Update {
    private static Bullet[] _conv = new Bullet[0];
    
    public final long ticks;
    public final User.Update[] usersOnScreen;
    public final Bullet[] bullets;
    
    public Update(long ticks, User.Update[] usersOnScreen, ConcurrentLinkedDeque<Bullet> bullets) {
      this.ticks = ticks;
      this.usersOnScreen = usersOnScreen;
      this.bullets = bullets.toArray(_conv);
    }
  }
}