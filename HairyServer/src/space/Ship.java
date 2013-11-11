package space;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import space.celestials.StarSystem;
import space.physics.Entity;
import sql.SQL;

public class Ship extends Entity {
  private static SQL sql = SQL.getInstance();
  private static PreparedStatement select = sql.prepareStatement("SELECT * FROM `ships` WHERE `system_id`=?");
  private static PreparedStatement update = sql.prepareStatement("UPDATE `ships` SET `system`=?, `x`=?, `y`=? WHERE id=?");
  
  private static Server _server = Server.instance();
  
  public static ArrayList<Ship> load(StarSystem system) throws SQLException {
    select.setInt(1, system.id);
    
    try(ResultSet r = select.executeQuery()) {
      ArrayList<Ship> ship = new ArrayList<>();
      
      while(r.next()) {
        ship.add(new Ship(r.getInt("id"), r.getDouble("x"), r.getDouble("y"), 16, r.getString("name"), system, r.getInt("user_id")));
      }
      
      return ship;
    }
  }
  
  private User _user;
  
  public final StarSystem system;
  public final String name;
  
  private int _userID;
  
  private double _turnSpeed;
  
  private boolean _turnLeft;
  private boolean _turnRight;
  private boolean _isFiring;
  
  private Ship(int id, double x, double y, int size, String name, StarSystem system, int user) {
    super(id, x, y, size);
    this.name = name;
    _userID = user;
    this.system = system;
    
    maxVel = 6;
    _turnSpeed = 5;
  }
  
  public void sendUpdate(Entity.Update[] update) {
    if(_user != null) {
      _user.sendUpdate(update);
    }
  }
  
  public void use(User user) {
    if(_user != null) {
      user.sendMessage("Server", "That ship is already in use by " + _user.name + ".");
      _user.sendMessage("Server", user.name + " tried to use this ship.");
      return;
    }
    
    _user = user;
    _user.sendUseShip(this);
  }
  
  public void leave() {
    _user = null;
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
    //TODO: Shoot things
  }
  
  private void thrustersOff() {
    acc = 0;
  }
  
  public void save() throws SQLException {
    update.setDouble(1, x);
    update.setDouble(2, y);
    update.setInt(3, id);
    update.execute();
  }
  
  @Override
  public void update(double deltaT) {
    super.update(deltaT);
    
    if(_turnLeft) {
      angle -= _turnSpeed;
      angle %= 360;
    }
    
    if(_turnRight) {
      angle += _turnSpeed;
      angle %= 360;
    }
    
    if(_isFiring) fire();
  }
  
  public static class Keys {
    public int keys;
  }
  
  public static class Use {
    public Use() { }
    public Use(int id, int s) {
      this.id = id;
      this.s = s;
    }
    
    public int id;
    public int s;
  }
}