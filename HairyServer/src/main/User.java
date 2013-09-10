package main;

import java.util.Date;
import java.util.LinkedList;

import com.corundumstudio.socketio.SocketIOClient;

public class User extends Entity {
  private Server _server = Server.instance();
  
  public final SocketIOClient socket;
  
  private final LinkedList<Cmd> _cmd = new LinkedList<>();
  
  public String name;
  public double vx, vy;
  public double acc, angle;
  public double velMax = 6;
  public double turnSpeed = 15;
  public int guns = 1;
  public int maxBullets = 3;
  public int life;
  public int shields;
  public int kills;
  public int deaths;
  public int bullets;
  public long lastReported = new Date().getTime();
  
  public User(String name, int id, SocketIOClient socket, double x, double y, int life, int shields) {
    super(id, x, y, 32);
    this.name = name;
    this.socket = socket;
    
    this.life = life;
    this.shields = shields;
  }
  
  public Stats serializeStats() {
    return new Stats();
  }
  
  public Update serializeUpdate() {
    return new Update(name, (int)x, (int)y, angle, shields);
  }
  
  public void addCommand(Cmd cmd) {
    _cmd.add(cmd);
  }
  
  public void processCommands() {
    Cmd cmd;
    while((cmd = _cmd.poll()) != null) {
      if((cmd._commands & 0x01) != 0) turnLeft();
      if((cmd._commands & 0x02) != 0) turnRight();
      if((cmd._commands & 0x04) != 0) thruster();
      if((cmd._commands & 0x08) != 0) reverse();
      if((cmd._commands & 0x10) != 0) fire();
      if((cmd._commands & 0x20) != 0) thrustersOff();
    }
  }
  
  public void update(double deltaT) {
    double theta = Math.toRadians(angle);
    
    //TODO: work delta into here
    vx = constrain(vx + Math.cos(theta) * acc, -velMax, velMax);
    vy = constrain(vy + Math.sin(theta) * acc, -velMax, velMax);
    
    displace();
  }
  
  private void displace() {
    x += vx;
    y += vy;
    
    int xmin = size / 2;
    int ymin = size / 2;
    int xmax = Server.W - xmin; //TODO: No more fixed size
    int ymax = Server.H - ymin;
    
    if(x < xmin) { x = xmin; vx = 0; }
    if(x > xmax) { x = xmax; vx = 0; }
    if(y < ymin) { y = ymin; vy = 0; }
    if(y > ymax) { y = ymax; vy = 0; }
  }
  
  private double constrain(double val, double min, double max) {
    return Math.max(min, Math.min(val, max));
  }
  
  private void turnLeft() {
    angle -= turnSpeed;
    angle %= 360;
  }
  
  private void turnRight() {
    angle += turnSpeed;
    angle %= 360;
  }
  
  private void thruster() {
    acc = _server.acc;
  }
  
  private void reverse() {
    acc = -_server.dec;
  }
  
  private void fire() {
    int maxBullets = this.maxBullets * guns;
    
    if(bullets + guns <= maxBullets) {
      float center = (guns - 1) / 2;
      float offset = 0;
      
      for(int i = 0; i < guns; i++) {
        if(i < center) {
          offset = (center - i) * -Server.spread;
        } else if(i > center) {
          offset = (i - center) * Server.spread;
        }
        
        _server.addBullet(new Bullet(this, offset));
        bullets++;
      }
    }
  }
  
  private void thrustersOff() {
    acc = 0;
  }
  
  public static class Login {
    public String name;
    
    public Login() { }
    public Login(String name) {
      this.name = name;
    }
  }
  
  public static class Cmd {
    private int _src;
    private int _commands;
    
    public Cmd() { }
    public Cmd(int src, int commands) {
      _src      = src;
      _commands = commands;
    }
    
    public int getSrc()      { return _src; }
    public int getCommands() { return _commands; }
    public void setSrc     (int src)      { _src = src; }
    public void setCommands(int commands) { _commands = commands; }
  }
  
  public static class Params {
    private String _id;
    private String _color;
    
    public Params() { }
    public Params(String id, String color) {
      _id = id;
      _color = color;
    }
    
    public String getId()    { return _id; }
    public String getColor() { return _color; }
    public void setId   (String id)    { _id = id; }
    public void setColor(String color) { _color = color; }
  }
  
  public class Stats {
    public int getLife() { return life; }
    public int getShields() { return shields; }
    public int getGuns() { return guns; }
  }
  
  public class Update {
    public final String name;
    public final int x, y;
    public final double angle;
    public final int shields;
    
    public Update(String name, int x, int y, double angle, int shields) {
      this.name = name;
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.shields = shields;
    }
  }
}