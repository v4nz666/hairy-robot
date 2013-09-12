package main;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import sql.SQL;

import com.corundumstudio.socketio.SocketIOClient;

public class User extends Entity {
  private static SQL sql = SQL.getInstance();
  private static PreparedStatement isAuthed = sql.prepareStatement("SELECT `id`, `auth` FROM `users` WHERE `username`=?");
  private static PreparedStatement select   = sql.prepareStatement("SELECT * FROM `space_users` WHERE `user_id`=?");
  
  public static User getUserIfAuthed(SocketIOClient socket, String name, String auth) throws SQLException {
    isAuthed.setString(1, name);
    
    try(ResultSet r = isAuthed.executeQuery()) {
      if(r.next()) {
        if(auth.equals(r.getString("auth"))) {
          select.setInt(1, r.getInt("id"));
          
          try(ResultSet r2 = select.executeQuery()) {
            if(r2.next()) {
              User user = new User(socket, name, r2.getFloat("x"), r2.getFloat("y"));
              user.maxLife = r2.getInt("max_life");
              user.maxShields = r2.getInt("max_shields");
              user.maxGuns = r2.getInt("max_guns");
              user.maxBullets = r2.getInt("max_bullets");
              user.maxVel = r2.getFloat("max_vel");
              user.life = Math.min(r2.getInt("life"), user.maxLife);
              user.shields = Math.min(r2.getInt("shields"), user.maxShields);
              user.guns = Math.min(r2.getInt("guns"), user.maxGuns);
              user.turnSpeed = r2.getFloat("turn_speed");
              user.size = r2.getInt("size");
              user.color = r2.getString("colour");
              user.kills = r2.getInt("kills");
              user.deaths = r2.getInt("deaths");
              return user;
            }
          }
        }
      }
    }
    
    return null;
  }
  
  private Server _server = Server.instance();
  
  public final SocketIOClient socket;
  
  public String name;
  public double vx, vy;
  public double acc, angle;
  
  public int    maxLife;
  public int    maxShields;
  public int    maxGuns;
  public int    maxBullets = 3;
  public double maxVel = 6;
  
  public int life;
  public int shields;
  public int guns = 1;
  
  public double turnSpeed = 5;
  public String color;
  
  public int kills;
  public int deaths;
  
  public int bullets;
  public int keys;
  
  public long lastBullet;
  
  private User(SocketIOClient socket, String name, float x, float y) {
    super(Server.getID(), x, y, 32);
    this.name = name;
    this.socket = socket;
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
  
  public Add serializeAdd() {
    return new Add();
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
      if(thrust) { return; }
    }
    
    thrustersOff();
  }
  
  public void update(double deltaT) {
    double theta = Math.toRadians(angle);
    
    //TODO: work delta into here
    vx = constrain(vx + Math.cos(theta) * acc, -maxVel, maxVel);
    vy = constrain(vy + Math.sin(theta) * acc, -maxVel, maxVel);
    
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
    if(lastBullet <= System.nanoTime()) {
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
        
        lastBullet = System.nanoTime() + 100000000;
      }
    }
  }
  
  private void thrustersOff() {
    acc = 0;
  }
  
  public static class Login {
    public String name;
    public String auth;
  }
  
  public static class Keys {
    public int keys;
  }
  
  public class Params {
    public int getId() { return id; }
  }
  
  public class Stats {
    public int getId() { return id; }
    public int getMaxLife() { return maxLife; }
    public int getMaxShields() { return maxShields; }
    public int getLife() { return life; }
    public int getShields() { return shields; }
    public int getGuns() { return guns; }
  }
  
  public class Update {
    public int getId() { return id; }
    public int getX() { return (int)x; }
    public int getY() { return (int)y; }
    public double getAngle() { return angle; }
  }
  
  public class Add {
    public int getId() { return id; }
    public String getName() { return name; }
    public String getColor() { return color; }
    public int getSize() { return size; }
    public int getMaxLife() { return maxLife; }
    public int getMaxShields() { return maxShields; }
    public int getLife() { return life; }
    public int getShields() { return shields; }
  }
  
  public class Remove {
    public int getId() { return id; }
  }
}