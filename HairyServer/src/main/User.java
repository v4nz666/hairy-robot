package main;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import space.game.Bullet;
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
              User user = new User(socket, r2.getInt("id"), name, r2.getDouble("x"), r2.getDouble("y"), r2.getInt("size"));
              user.maxLife = r2.getInt("max_life");
              user.maxShields = r2.getInt("max_shields");
              user.maxVel = r2.getFloat("max_vel");
              user.life = Math.min(r2.getInt("life"), user.maxLife);
              user.shields = Math.min(r2.getInt("shields"), user.maxShields);
              user._gun = new Gun(space.data.guns.Gun.getGunDefault(), space.data.guns.Gun.getGunDefault().getBullets()[0]); //Gun.getGunByName(r2.getString("gun"));
              user.turnSpeed = r2.getFloat("turn_speed");
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
  public final int dbID;
  public final String name;
  
  public int maxLife;
  public int maxShields;
  
  public int life;
  public int shields;
  
  public double turnSpeed = 5;
  public String color;
  
  public int kills;
  public int deaths;
  
  private Gun _gun;
  
  private boolean _turnLeft;
  private boolean _turnRight;
  private boolean _isFiring;
  
  private Params _params = new Params();
  private Stats  _stats  = new Stats();
  private Update _update = new Update();
  private Add    _add    = new Add();
  private Remove _remove = new Remove();
  private Hit    _hit    = new Hit();
  private Kill   _kill   = new Kill();
  
  private User(SocketIOClient socket, int dbID, String name, double x, double y, int size) {
    super(Server.getID(), x, y, size);
    this.dbID = dbID;
    this.name = name;
    this.socket = socket;
  }
  
  public Params       serializeParams() { return _params; }
  public Stats        serializeStats()  { return _stats;  }
  public Update       serializeUpdate() { return _update; }
  public Add          serializeAdd()    { return _add;    }
  public Remove       serializeRemove() { return _remove; }
  public Hit          serializeHit(Bullet bullet) { _hit._bullet = bullet; return _hit; }
  public Kill         serializeKill()   { return _kill;   }
  
  public void setGun(space.data.guns.Gun gun) {
    _gun = new Gun(gun, gun.getBullets()[0]);
  }
  
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
      _isFiring  = false;
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
    _gun.fire(this);
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
    update.setString(6, ""); //gun.getClass().getName());
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
    
    int xmin = size;
    int ymin = xmin;
    int xmax = Server.star_system.getSize() - xmin;
    int ymax = Server.star_system.getSize() - ymin;
    
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
    public StarSystem getSystem() { return Server.star_system; }
  }
  
  public class Stats {
    public int getId() { return id; }
    public int getMaxLife() { return maxLife; }
    public int getMaxShields() { return maxShields; }
    public int getLife() { return life; }
    public int getShields() { return shields; }
    public String getGun() { return _gun.gun.getName(); }
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
    public String getGun() { return _gun.gun.getName(); }
  }
  
  public class Remove {
    public int getId() { return id; }
  }
  
  public class Hit {
    private Bullet _bullet;
    public int getId() { return id; }
    public double getX() { return _bullet.x; }
    public double getY() { return _bullet.y; }
  }
  
  public class Kill {
    public int getId() { return id; }
  }

}