package space;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import space.celestials.StarSystem;
import space.physics.Entity;
import sql.SQL;

public class Ship extends Entity {
  private static SQL sql = SQL.getInstance();
  private static PreparedStatement select = sql.prepareStatement("SELECT * FROM `space_ships` WHERE `user_id`=?");
  private static PreparedStatement update = sql.prepareStatement("UPDATE `space_ships` SET `system`=?, `x`=?, `y`=? WHERE id=?");
  
  private static Server _server = Server.instance();
  
  public static Ship load(int id) throws SQLException {
    select.setInt(1, id);
    
    try(ResultSet r = select.executeQuery()) {
      if(r.next()) {
        int s = r.getInt("system_id");
        StarSystem system = r.wasNull() ? null : _server.system(s);
        return new Ship(r.getInt("id"), r.getDouble("x"), r.getDouble("y"), 16, r.getString("name"), system);
      }
    }
    
    return null;
  }
  
  private StarSystem _system;
  
  private Params    _params       = new Params();
  private SysParams _systemParams = new SysParams();
  private Update    _update       = new Update();
  private Add       _add          = new Add();
  private Remove    _remove       = new Remove();
  
  public final String name;
  
  private double _turnSpeed;
  
  private boolean _turnLeft;
  private boolean _turnRight;
  private boolean _isFiring;
  
  public Params    serializeParams() { return _params; }
  public SysParams serializeSystem() { return _systemParams; }
  public Update    serializeUpdate() { return _update; }
  public Add       serializeAdd()    { return _add;    }
  public Remove    serializeRemove() { return _remove; }
  
  private Ship(int id, double x, double y, int size, String name, StarSystem system) {
    super(id, x, y, size);
    this.name = name;
    _system = system;
    
    maxVel = 6;
    _turnSpeed = 5;
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
  
  public class Params {
    public int getId() { return id; }
  }
  
  public class SysParams {
    public StarSystem getSystem() { return _system; }
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
}