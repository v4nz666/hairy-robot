package space.celestials;

import java.util.ArrayList;
import java.util.Random;

import space.physics.Entity;
import space.physics.Sandbox;

public abstract class Celestial extends Entity {
  @Override
  public String toString() {
    return "Celestial " + id + " @ (" + (int)x + ", " + (int)y + "), size: " + size + ", dist: " + _distance + ", mass: " + _mass + ", temp: " + _temp + " (" + super.toString() + ")";
  }
  
  private static Random _rand = new Random();
  
  protected ArrayList<Celestial> _celestial = new ArrayList<>();
  private Celestial[] _celestialToArray = new Celestial[0];
  
  protected StarSystem _system;
  protected Celestial _parent;
  protected double _distance;
  protected double _mass;
  protected double _temp;
  protected double _theta;  // Orbital Position
  protected double _vo = 1000;     // Orbital Velocity
  
  public Celestial(StarSystem system, Celestial parent, double distance, int size, double mass, double temp) {
    super(system.nextID(), null, 0, 0, size);
    _system = system;
    _parent = parent;
    _distance = distance;
    _mass = mass;
    _temp = temp;
    _theta = _rand.nextDouble() * 360;
    
    update2(1);
    
    if(!(this instanceof Asteroid)) {
      System.out.println(this);
    }
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
