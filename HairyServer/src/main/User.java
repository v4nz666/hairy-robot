package main;

import java.util.Date;

import com.corundumstudio.socketio.SocketIOClient;

public class User extends Entity {
  private Server _server = Server.instance();
  
  public final SocketIOClient socket;
  
  public String name;
  public double vx, vy;
  public double acc, angle;
  public double velMax = 6;
  public double turnSpeed = 5;
  public int guns = 1;
  public int maxBullets = 3;
  public int life;
  public int shields;
  public int kills;
  public int deaths;
  public int bullets;
  public String color;
  public long lastReported = new Date().getTime();
  public int keys;
  
  public User(String name, int id, SocketIOClient socket, double x, double y, int life, int shields) {
    super(id, x, y, 32);
    this.name = name;
    this.socket = socket;
    
    this.life = life;
    this.shields = shields;
  }
  
  public Params serializeParams() {
    return new Params();
  }
  
  public Stats serializeStats() {
    return new Stats();
  }
  
  public Update serializeUpdate() {
    return new Update();
  }
  
  public Remove serializeRemove() {
    return new Remove();
  }
  
  public void processCommands() {
    if(keys != 0) {
      boolean thrust = false;
      if((keys & 0x01) != 0) { turnLeft(); }
      if((keys & 0x02) != 0) { thruster(); thrust = true; }
      if((keys & 0x04) != 0) { turnRight(); }
      if((keys & 0x08) != 0) { reverse(); thrust = true; }
      if((keys & 0x10) != 0) { fire(); }
      if(!thrust) { thrustersOff(); }
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
  }
  
  public static class Keys {
    public int keys;
  }
  
  public class Params {
    public int getId() { return id; }
  }
  
  public class Stats {
    public int getLife() { return life; }
    public int getShields() { return shields; }
    public int getGuns() { return guns; }
  }
  
  public class Update {
    public int getId() { return id; }
    public String getName() { return name; }
    public String getColor() { return color; }
    public int getX() { return (int)x; }
    public int getY() { return (int)y; }
    public double getAngle() { return angle; }
    public int getShields() { return shields; }
  }
  
  public class Remove {
    public int getId() { return id; }
  }
}