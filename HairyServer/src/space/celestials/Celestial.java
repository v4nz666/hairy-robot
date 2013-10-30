package space.celestials;

import java.util.ArrayList;
import java.util.Random;

import main.Entity;

public abstract class Celestial extends Entity {
  @Override
  public String toString() {
    return "Celestial @ (" + (int)x + ", " + (int)y + "), size: " + size + ", dist: " + _distance + ", mass: " + _mass + ", temp: " + _temp + " (" + super.toString() + ")";
  }
  
  private static Random _rand = new Random();
  
  protected ArrayList<Celestial> _celestial = new ArrayList<>();
  private Celestial[] _celestialToArray = new Celestial[0];
  
  protected StarSystem _system;
  protected Celestial _parent;
  protected double _distance;
  protected double _mass;
  protected double _temp;
  protected double _theta;
  
  public Celestial(StarSystem system, Celestial parent, double distance, int size, double mass, double temp) {
    super(-1, 0, 0, size);
    _system = system;
    _parent = parent;
    _distance = distance;
    _mass = mass;
    _temp = temp;
    _theta = _rand.nextDouble() * 360;
    double px = _parent != null ? _parent.x : _system.getSize() / 2;
    double py = _parent != null ? _parent.y : _system.getSize() / 2;
    
    x = px + Math.cos(_theta * Math.PI / 180) * distance;
    y = py - Math.sin(_theta * Math.PI / 180) * distance;
    
    if(!(this instanceof Asteroid)) {
      System.out.println(this);
    }
  }
  
  public Celestial[] getCelestial() {
    return _celestial.toArray(_celestialToArray);
  }
  
  public abstract String getFill();
  
  public String getStroke() {
    return null;
  }
  
  public boolean addCelestial(Celestial c) {
    return _celestial.add(c);
  }
}