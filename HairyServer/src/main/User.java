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
  private static PreparedStatement update   = sql.prepareStatement("UPDATE `space_users` SET `max_life`=?, `max_shields`=?, `max_vel`=?, `life`=?, `shields`=?, `gun`=?, `turn_speed`=?, `size`=?, `colour`=?, `x`=?, `y`=?, `kills`=?, `deaths`=? WHERE id=?");
  
  public static User getUserIfAuthed(SocketIOClient socket, String name, String auth) throws SQLException {
    isAuthed.setString(1, name);
    
    try(ResultSet r = isAuthed.executeQuery()) {
      if(r.next()) {
        if(auth.equals(r.getString("auth"))) {
          select.setInt(1, r.getInt("id"));
          
          try(ResultSet r2 = select.executeQuery()) {
            if(r2.next()) {
              User user = new User(socket, name, r2.getFloat("x"), r2.getFloat("y"));
              user.dbID = r2.getInt("id");
              user.maxLife = r2.getInt("max_life");
              user.maxShields = r2.getInt("max_shields");
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
  
  public int dbID;
  public String name;
  
  public int maxLife;
  public int maxShields;
  
  public int life;
  public int shields;
  public Gun gun;
  
  public double turnSpeed = 5;
  public String color;
  
  public int kills;
  public int deaths;
  
  public int bullets;
  
  public long lastBullet;
  
  private boolean _turnLeft;
  private boolean _turnRight;
  private boolean _isFiring;
  
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
  
  public void handleInput(int keys) {
    if(keys != 0) {
      boolean thrust = false;
      _turnLeft  = (keys & 0x01) != 0;
      _turnRight = (keys & 0x04) != 0;
      _isFiring  = (keys & 0x10) != 0;
      
      if((keys & 0x02) != 0) { thruster(); thrust = true; }
      if((keys & 0x08) != 0) { reverse(); thrust = true; }
      if(thrust) { return; }
    } else {
      _turnLeft  = false;
      _turnRight = false;
    }
    
    thrustersOff();
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
  
  public void save() throws SQLException {
    update.setInt(1, maxLife);
    update.setInt(2, maxShields);
    update.setDouble(3, maxVel);
    update.setInt(4, life);
    update.setInt(5, shields);
    update.setString(6, gun.getClass().getName());
    update.setDouble(7, turnSpeed);
    update.setInt(8, size);
    update.setString(9, color);
    update.setDouble(10, x);
    update.setDouble(11, y);
    update.setInt(12, kills);
    update.setInt(13, deaths);
    update.setInt(14, dbID);
    update.execute();
  }
  
  @Override
  public void update(double deltaT) {
    super.update(deltaT);
    
    if(_turnLeft) {
      angle -= turnSpeed;
      angle %= 360;
    }
    
    if(_turnRight) {
      angle += turnSpeed;
      angle %= 360;
    }
    
    if(_isFiring) fire();
    
    int xmin = size / 2;
    int ymin = xmin;
    int xmax = Server.W - xmin; //TODO: No more fixed size
    int ymax = Server.H - ymin;
    
    if(x < xmin) { x = xmin; vx = 0; }
    if(x > xmax) { x = xmax; vx = 0; }
    if(y < ymin) { y = ymin; vy = 0; }
    if(y > ymax) { y = ymax; vy = 0; }
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