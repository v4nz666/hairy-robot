package main;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import space.celestials.StarSystem;
import space.physics.Entity;
import sql.SQL;

import com.corundumstudio.socketio.SocketIOClient;

public class User extends Entity {
  private static SQL sql = SQL.getInstance();
  private static PreparedStatement isAuthed = sql.prepareStatement("SELECT `id`, `auth` FROM `users` WHERE `username`=?");
  private static PreparedStatement select   = sql.prepareStatement("SELECT * FROM `space_users` WHERE `user_id`=?");
  private static PreparedStatement update   = sql.prepareStatement("UPDATE `space_users` SET `x`=?, `y`=? WHERE id=?");
  
  public static User getUserIfAuthed(SocketIOClient socket, String name, String auth, StarSystem system) throws SQLException {
    isAuthed.setString(1, name);
    
    try(ResultSet r = isAuthed.executeQuery()) {
      if(r.next()) {
        if(auth.equals(r.getString("auth"))) {
          select.setInt(1, r.getInt("id"));
          
          try(ResultSet r2 = select.executeQuery()) {
            if(r2.next()) {
              User user = new User(socket, r2.getInt("id"), name, r2.getDouble("x"), r2.getDouble("y"), 16, system);
              user.maxVel = 6;
              user.turnSpeed = 5;
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
  
  private StarSystem _system;
  
  public double turnSpeed;
  
  private boolean _turnLeft;
  private boolean _turnRight;
  private boolean _isFiring;
  
  private Params    _params       = new Params();
  private SysParams _systemParams = new SysParams();
  private Update    _update       = new Update();
  private Add       _add          = new Add();
  private Remove    _remove       = new Remove();
  
  private User(SocketIOClient socket, int dbID, String name, double x, double y, int size, StarSystem system) {
    super(Server.getID(), x, y, size);
    this.dbID = dbID;
    this.name = name;
    this.socket = socket;
    _system = system;
  }
  
  public StarSystem system() { return _system; }
  
  public Params       serializeParams() { return _params; }
  public SysParams    serializeSystem() { return _systemParams; }
  public Update       serializeUpdate() { return _update; }
  public Add          serializeAdd()    { return _add;    }
  public Remove       serializeRemove() { return _remove; }
  
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
    //TODO: Shoot things
  }
  
  private void thrustersOff() {
    acc = 0;
  }
  
  public void save() throws SQLException {
    update.setDouble(1, x);
    update.setDouble(2, y);
    update.setInt(3, dbID);
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
    
    double xmin = size;
    double ymin = xmin;
    double xmax = Server.star_system.getSize() - xmin;
    double ymax = Server.star_system.getSize() - ymin;
    
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
  
  public class SysParams {
    public StarSystem getSystem() { return Server.star_system; }
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
  }
  
  public class Remove {
    public int getId() { return id; }
  }
  
  public static class Message {
    public String id;
    public String msg;
    
    public Message() { }
    public Message(String id, String msg) {
      this.id = id;
      this.msg = msg;
    }
  }
}