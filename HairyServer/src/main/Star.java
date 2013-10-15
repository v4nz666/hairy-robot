package main;

import java.util.Random;

public class Star extends Entity {
  
  private static Random _rand = new Random();
  private float _mass;
  private int _temperature;
  
  public float getMass() { return this._mass; }
  public int getTemp() { return this._temperature; }
  
  public static final Star Generate(Star_System system) {
    
    int x = system.getSize() / 2;
    int y = system.getSize() / 2;
    
    // Radius ~= .5 - 5 solar radii (at 1/1000 scale)
    int radius = 12000 + _rand.nextInt(100000);
    
    // Mass ~= 0.05 - 50 Solar masses;
    float mass = 0.05f + 50 * _rand.nextFloat();
    
    // Temperatures range from 300K to 30000K
    int temp = 3000 + 1000 * _rand.nextInt(27);
    
    return new Star(-1, x, y, radius, mass, temp);
  }
  
  public Star(int id, double x, double y, int size, float mass, int temperature) {
    super(id, x, y, size);
    System.out.println("Star Coords[" + (int)x + "," + (int)y + "]");
    System.out.println("Star Size[" + (int)size + "]");
    
    this._mass = mass;
    this._temperature = temperature;
  }
}
