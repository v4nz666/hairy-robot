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
              user.maxBullets = r2.getInt("max_bullets");
              user.maxVel = r2.getFloat("max_vel");
              user.life = Math.min(r2.getInt("life"), user.maxLife);
              user.shields = Math.min(r2.getInt("shields"), user.maxShields);
              user.gun = Gun.getGunByName(r2.getString("gun"));
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
  
  public int maxLife;
  public int maxShields;
  public int maxBullets;
  
  public int life;
  public int shields;
  public Gun gun;
  
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
  
  public Params serializeParams() { return new Params(); }
  public Stats  serializeStats()  { return new Stats();  }
  public Update serializeUpdate() { return new Update(); }
  public Add    serializeAdd()    { return new Add();    }
  public Remove serializeRemove() { return new Remove(); }
  
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
    gun.fire(this);
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
    public String getGun() { return gun.getName(); }
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
    public String getGun() { return gun.getName(); }
  }
  
  public class Remove {
    public int getId() { return id; }
  }
}