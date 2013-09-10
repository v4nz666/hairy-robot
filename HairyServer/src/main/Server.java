package main;

import java.util.HashMap;
import java.util.Random;
import java.util.concurrent.ConcurrentLinkedDeque;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;

public class Server {
  private static Server _instance = new Server();
  public static Server instance() { return _instance; }
  
  public static final int W = 800, H = 600;
  public static final int spread = 15;
  public static final int x = W / 2;
  public static final int y = H / 2;
  public static final int life = 100;
  public static final int shields = 100;
  public static final int guns = 5;
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
  
  private boolean _running;
  private long _interval;
  private int _ticksPerSecond = 60;
  private long _ticksTotal;
  private int _tps = 60;
  
  private long _powerupTimer;
  
  private Server() { }
  
  public void start() throws InterruptedException {
    Configuration config = new Configuration();
    config.setPort(9092);
    
    _server = new SocketIOServer(config);
    _server.addConnectListener(new ConnectListener() {
      @Override
      public void onConnect(SocketIOClient client) {
        addUser(client);
      }
    });
    
    _server.addDisconnectListener(new DisconnectListener() {
      @Override
      public void onDisconnect(SocketIOClient client) {
        removeUser(client);
      }
    });
    
    _server.addEventListener("msg", Msg.class, new DataListener<Msg>() {
      @Override
      public void onData(SocketIOClient client, Msg data, AckRequest ackSender) {
        _server.getBroadcastOperations().sendEvent("msg", data);
      }
    });
    
    _server.addEventListener("cmd", User.Cmd.class, new DataListener<User.Cmd>() {
      @Override
      public void onData(SocketIOClient client, User.Cmd data, AckRequest ackSender) {
        addCommand(client, data);
      }
    });
    
    _server.start();
    
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
    
    _server.stop();
  }
  
  private void addUser(SocketIOClient socket) {
    int id = _user.size();
    User user = new User(id, socket, x, y, life, shields);
    _user.add(user);
    _userMap.put(socket, user);
    
    System.out.println("New user added");
    socket.sendEvent("msg", new Msg("Server", "Welcome!!"));
    socket.sendEvent("setParams", new User.Params(String.valueOf(id), getColor()));
    socket.sendEvent("powerups", _powerup.toArray(_powerupConv));
    //TODO: Need to send scores here?
  }
  
  private void removeUser(SocketIOClient socket) {
    User user = _userMap.get(socket);
    
    System.out.println("Disconnecting " + user.id);
    _user.remove(user);
    _userMap.remove(socket);
  }
  
  private void killUser(User victim, User attacker) {
    victim.life = life;
    victim.shields = shields;
    victim.guns = 1;
    victim.x = W / 2;
    victim.y = H / 2;
    victim.vx = 0;
    victim.vy = 0;
    victim.angle = 0;
    victim.deaths++;
    
    System.out.println("User " + victim.id + " killed by user " + attacker.id);
    
    attacker.kills++;
    
    _server.getBroadcastOperations().sendEvent("msg", new Msg("Server", victim.id + " got killed by " + attacker.id));
    //TODO: User scores
  }
  
  public void addBullet(Bullet bullet) {
    _bullet.push(bullet);
  }
  
  public void addPowerup() {
    _powerup.push(Powerup.random(_rand.nextInt(W), _rand.nextInt(H)));
    _server.getBroadcastOperations().sendEvent("powerups", _powerup.toArray(_powerupConv));
  }
  
  private void addCommand(SocketIOClient socket, User.Cmd cmd) {
    User user = _userMap.get(socket);
    user.addCommand(cmd);
    System.out.println("User " + user.id + " command " + cmd.getCommands());
  }
  
  private String getColor() {
    return String.format("#%06x", _rand.nextInt(0x1000000));
  }
  
  private void tick(double deltaT) {
    for(Bullet bullet : _bullet) {
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      
      if(bullet.x < -bulletSize || bullet.x > W + bulletSize ||
         bullet.y < -bulletSize || bullet.y > H + bulletSize) {
        bullet._user.bullets--;
        _bullet.remove(bullet);
        System.out.println("Removing");
      }
    }
    
    User.Update[] update = new User.Update[_user.size()];
    
    int i = 0;
    for(User user : _user) {
      user.processCommands();
      user.update(deltaT);
      
      for(Bullet bullet : _bullet) {
        if(checkCollisions(user, bullet)) {
          String size;
          
          if(user.shields > 0) {
            size = "small";
            user.shields = Math.max(0,  user.shields - bullet.damage);
          } else {
            size = "medium";
            user.life -= bullet.damage;
          }
          
          if(user.life <= 0) {
            killUser(user, bullet._user);
            _server.getBroadcastOperations().sendEvent("explosion", new Bullet.Explosion("huge", (int)bullet.x, (int)bullet.y, _ticksTotal));
          }
          
          _bullet.remove(bullet);
          bullet._user.bullets--;
          
          user.socket.sendEvent("msg", new Msg("Server", "Shields: " + user.shields + ", Life: " + user.life + ", Guns: " + user.guns));
          _server.getBroadcastOperations().sendEvent("explosion", new Bullet.Explosion(size, (int)bullet.x, (int)bullet.y, _ticksTotal));
        }
      }
      
      for(Powerup powerup : _powerup) {
        if(checkCollisions(user, powerup)) {
          powerup.use(user);
          _powerup.remove(powerup);
          user.socket.sendEvent("msg", new Msg("Server", "Shields: " + user.shields + ", Life: " + user.life + ", Guns: " + user.guns));
          _server.getBroadcastOperations().sendEvent("powerups", _powerup.toArray(_powerupConv));
        }
      }
      
      update[i++] = user.serializeForUpdate();
    }
    
    if(_powerupTimer <= System.nanoTime()) {
      _powerupTimer = System.nanoTime() + (_rand.nextInt(5) + 10) * 1000000000l; // 5-15 seconds
      if(_powerup.size() < maxPowerups) {
        addPowerup();
      }
    }
    
    _server.getBroadcastOperations().sendEvent("update", new Update(_ticksTotal, update, _bullet));
  }
  
  private boolean checkCollisions(Entity a, Entity b) {
    // Can't collide with yourself, or bullets you've fired
    if(a.id == b.id) return false;
    
    double dist = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    return (dist < a.size / 2 + b.size / 2);
  }
  
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