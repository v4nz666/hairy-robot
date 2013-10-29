package space.celestials;

import java.util.Random;

public class Star extends Celestial {
  @Override
  public String toString() {
    return "Star " + super.toString();
  }
  
  private static Random _rand = new Random();
  
  public double getMass() { return _mass; }
  public double getTemp() { return _temp; }
  
  public static final Star generate(StarSystem system, Celestial parent, double distance) {
    // Radius ~= .5 - 5 solar radii (at 1/1000 scale)
    int radius = 12000 + _rand.nextInt(100000);
    
    // Mass ~= 0.05 - 50 Solar masses;
    float mass = 0.05f + 50 * _rand.nextFloat();
    
    // Temperatures range from 300K to 30000K
    int temp = 3000 + 1000 * _rand.nextInt(27);
    
    return new Star(system, parent, distance, radius, mass, temp);
  }
  
  private Star(StarSystem system, Celestial parent, double distance, int size, float mass, int temp) {
    super(system, parent, distance, size, mass, temp);
  }
  
  public String getFill() {
    return "yellow";
  }
}