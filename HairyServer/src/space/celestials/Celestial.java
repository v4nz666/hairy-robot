package space.celestials;

import java.util.ArrayList;
import java.util.Random;

import main.Entity;

public abstract class Celestial extends Entity {
  private static Random _rand = new Random();
  
  protected ArrayList<Celestial> _celestial = new ArrayList<>();
  
  protected StarSystem _system;
  protected Celestial _parent;
  protected double _distance;
  protected double _mass;
  protected double _temp;
  
  public Celestial(StarSystem system, Celestial parent, double distance, int size, double mass, double temp) {
    super(-1, 0, 0, size);
    _system = system;
    _parent = parent;
    _distance = distance;
    _mass = mass;
    _temp = temp;
    
    // Select a random spot in the orbit to generate at
    int theta = _rand.nextInt(360);
    double px = _parent != null ? _parent.x : _system.getSize() / 2;
    double py = _parent != null ? _parent.y : _system.getSize() / 2;
    
    x = px + Math.cos(theta * Math.PI / 180) * distance;
    y = py - Math.sin(theta * Math.PI / 180) * distance;
  }
  
  public boolean addCelestial(Celestial c) {
    return _celestial.add(c);
  }
}