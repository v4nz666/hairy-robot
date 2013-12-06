package space.celestials;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import space.physics.Entity;
import space.physics.Sandbox;
import sql.SQL;

public abstract class Celestial extends Entity {
  @Override
  public String toString() {
    return "Celestial " + id + " @ (" + (int)x + ", " + (int)y + "), size: " + size + ", dist: " + _distance + ", mass: " + _mass + ", temp: " + _temp + " (" + super.toString() + ")";
  }
  
  private static SQL sql = SQL.getInstance();
  protected ArrayList<Celestial> _celestial;
  private Celestial[] _celestialToArray = new Celestial[0];
  
  protected int _dbID;
  
  protected StarSystem _system;
  protected Celestial _parent;
  protected String _name;
  protected double _distance;
  protected double _mass;
  protected double _temp;
  protected double _theta;  // Orbital Position
  protected double _vo = 1000;     // Orbital Velocity
  
  public static ArrayList<Celestial> load(StarSystem system) throws SQLException {
    PreparedStatement selectNoParent = sql.prepareStatement("SELECT * FROM `celestials` WHERE `system_id`=? AND `parent_id` IS NULL");
    selectNoParent.setInt(1, system.id);
    return load(system, null, selectNoParent);
  }
  
  public static ArrayList<Celestial> load(StarSystem system, Celestial parent) throws SQLException {
    PreparedStatement select = sql.prepareStatement("SELECT * FROM `celestials` WHERE `system_id`=? AND `parent_id`=?");
    select.setInt(1, system.id);
    select.setInt(2, parent._dbID);
    return load(system, parent, select);
  }
  
  private static ArrayList<Celestial> load(StarSystem system, Celestial parent, PreparedStatement s) throws SQLException {
    try(ResultSet r = s.executeQuery()) {
      ArrayList<Celestial> celestial = new ArrayList<>();
      
      while(r.next()) {
        switch(r.getString("type")) {
          case "star":     celestial.add(new Star        (system, parent, r)); break;
          case "planet":   celestial.add(new Planet      (system, parent, r)); break;
          case "moon":     celestial.add(new Moon        (system, parent, r)); break;
          case "belt":     celestial.add(new AsteroidBelt(system, parent, r)); break;
          case "asteroid": celestial.add(new Asteroid    (system, parent, r)); break;
        }
      }
      
      return celestial;
    }
  }
  
  public Celestial(StarSystem system, Celestial parent, ResultSet r) throws SQLException {
    super(system.nextID(), null, 0, 0, r.getInt("size"));
    _dbID = r.getInt("id");
    _system = system;
    _parent = parent;
    _name = r.getString("name");
    _distance = r.getDouble("distance");
    _mass = r.getDouble("mass");
    _temp = r.getDouble("temp");
    _theta = r.getDouble("theta");
    
    update2(1);
    
    if(!(this instanceof Asteroid)) {
      System.out.println(this);
    }
    
    _celestial = Celestial.load(system, this);
  }
  
  public Celestial[] getCelestial() {
    return _celestial.toArray(_celestialToArray);
  }
  
  public boolean addCelestial(Celestial c) {
    return _celestial.add(c);
  }
  
  //@Override
  public void update2(double deltaT) {
    _theta -= _vo;
    double px = _parent != null ? _parent.x : 0;
    double py = _parent != null ? _parent.y : 0;
    
    x = px + Math.cos(_theta * Math.PI / 180) * _distance;
    y = py - Math.sin(_theta * Math.PI / 180) * _distance;
  }

  public void addToSandbox(Sandbox s) {
    s.addToSandbox(this);
    
    for(Celestial c : _celestial) {
      c.addToSandbox(s);
    }
  }
  
  public class Add extends Entity.Add {
    public String getT() { return "c"; }
    public int getS() { return size; }
  }
}
