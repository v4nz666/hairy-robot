package space.celestials;

import java.util.Random;

public class Planet extends Celestial {
  private static Random _rand = new Random();
  
  public static Planet generate(StarSystem system, Celestial parent, double distance) {
    int scale = _rand.nextInt(10);
    int div;
    double d = distance;
    double sSize = system.getSize();
    
    // Constrain d so that inner/outer planets stay a reasonable size
    d = Math.max(Math.min(d, sSize / 15), sSize / 100);
    
    // Small planets
    if(scale <= 2) {
      div = 1000;
    } else if(scale >= 9) {
    // Large Planets
      div = 250;
    } else {
      div = 750;
    }
    
    int size = (int)((d / div) + (d / (div * 3) * _rand.nextFloat() - d / (div * 6)));
    
    //TODO: Mass/temp
    return new Planet(system, parent, distance, size, 0, 0);
  }
  
  private Planet(StarSystem system, Celestial parent, double distance, int size, float mass, int temp) {
    super(system, parent, distance, size, mass, temp);
    
    System.out.println("Planet: size [" + size + "] d[" + distance + "]" + "x,y[" + x + ", " + y + "]");
    
    generateMoons();
  }
  
  private void generateMoons() {
    int n = 1 + _rand.nextInt(Math.max(1, (size / 3000)));
    
    for(int i = 0; i < n; i++) {
      double d = Math.max(size * 3, size * i) + (size * i / 2);
      addCelestial(Moon.generate(_system, this, d));
    }
  }
}