package space.celestials;

import java.util.Random;

public class Moon extends Celestial {
  @Override
  public String toString() {
    return "Moon " + super.toString();
  }
  
  private static Random _rand = new Random(); 
  
  public static Moon generate(StarSystem system, Celestial parent, double distance) {
    int minSize = (int)(512 + (_rand.nextDouble() * 100 - 50)); 
    int size = Math.max(minSize, _rand.nextInt(parent.size / 8));
    
    return new Moon(system, parent, distance, size, 0, 0);
  }
  
  private Moon(StarSystem system, Celestial parent, double distance, int size, float mass, int temp) {
    super(system, parent, distance, size, mass, temp);
  }
}