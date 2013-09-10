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

public class Server {
  private static Server _instance = new Server();
  public static Server instance() { return _instance; }
  
  public static final int W = 800, H = 600;
  public static final int spread = 15;
  public final double acc = 1;
  public final double dec = 0.75;
  
  private Random _rand = new Random();
  
  private ConcurrentLinkedDeque<User> _user = new ConcurrentLinkedDeque<>();
  private HashMap<SocketIOClient, User> _userMap = new HashMap<>();
  private ConcurrentLinkedDeque<Bullet> _bullet = new ConcurrentLinkedDeque<>();
  
  private SocketIOServer _server;
  
  private final int x = W / 2;
  private final int y = H / 2;
  private final int life = 100;
  private final int shields = 100;
  private final int _bulletSize = 2;
  
  private Powerup[] _powerups;
  
  private boolean _running;
  private long _interval;
  private int _ticksPerSecond = 60;
  private long _ticksTotal;
  private int _tps = 60;
  
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
    socket.sendEvent("powerups", _powerups);
    //TODO: Need to send scores here?
  }
  
  public void addBullet(Bullet bullet) {
    _bullet.push(bullet);
  }
  
  private void addCommand(SocketIOClient socket, User.Cmd cmd) {
    User user = _userMap.get(socket);
    user.addCommand(cmd);
    System.out.println("User " + user.id + " command " + cmd.getCommands());
  }
  
  private String getColor() {
    return "#" + Integer.toString(_rand.nextInt(0x1000000), 0x10);
  }
  
  private void tick(double deltaT) {
    for(Bullet bullet : _bullet) {
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      
      if(bullet.x < -_bulletSize || bullet.x > W + _bulletSize ||
         bullet.y < -_bulletSize || bullet.y > H + _bulletSize) {
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
      update[i++] = user.serializeForUpdate();
    }
    
    _server.getBroadcastOperations().sendEvent("update", new Update(_ticksTotal, update, _bullet.toArray()));
  }
  
  public static class Update {
    public final long ticks;
    public final User.Update[] usersOnScreen;
    public final Object[] bullets; // Temporary
    
    public Update(long ticks, User.Update[] usersOnScreen, Object[] bullets) {
      this.ticks = ticks;
      this.usersOnScreen = usersOnScreen;
      this.bullets = bullets;
    }
  }
}