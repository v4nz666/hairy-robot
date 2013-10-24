package space.celestials;

import java.util.Random;

public class Star extends Celestial {
  private static Random _rand = new Random();
  
  public double getMass() { return _mass; }
  public double getTemp() { return _temp; }
  
  public static final Star generate(StarSystem system, double distance) {
    // Radius ~= .5 - 5 solar radii (at 1/1000 scale)
    int radius = 12000 + _rand.nextInt(100000);
    
    // Mass ~= 0.05 - 50 Solar masses;
    float mass = 0.05f + 50 * _rand.nextFloat();
    
    // Temperatures range from 300K to 30000K
    int temp = 3000 + 1000 * _rand.nextInt(27);
    
    return new Star(system, distance, radius, mass, temp);
  }
  
  private Star(StarSystem system, double distance, int size, float mass, int temp) {
    super(system, distance, size, mass, temp);
    
    System.out.println("Star Coords[" + x + "," + y + "]");
    System.out.println("Star Size[" + (int)size + "]");
    
    _mass = mass;
    _temp = temp;
  }
}