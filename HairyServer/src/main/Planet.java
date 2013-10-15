package main;

import java.util.Random;

public class Planet extends Entity {
  private static Random _rand = new Random();
  
  private int _mass;
  private int _distance;
  
  private static int generateSize(int d, Star_System _system) {
    
    int scale = _rand.nextInt(10);
    int div;
    
    // Constrain d so that inner/outer planets stay a reasonable size
    d = Math.max(Math.min(d, _system.getSize() / 15), _system.getSize() / 100);
    
    // Small planets
    if ( scale <= 2 ) {
      System.out.println("Small Planet");
      div = 1000;
    } else if ( scale >= 9 ) {
    // Large Planets
      System.out.println("Large Planet");
      div = 250;
    } else {
      System.out.println("Normal size Planet");
      div = 750;
    }
    
    return (int)((d / div) + (d / (div * 3) * _rand.nextFloat() - d/(div * 6)));
  }
  
  public Planet(Star_System _system, int d) {
    this(-1, 0, 0, generateSize(d, _system));
    
    this._distance = d;
    
    System.out.println("Generating Planet at distance [" + d + "]");
    
    // Select a random spot in the orbit to generate our planet at
    int theta = _rand.nextInt(360);
    int mid = _system.getSize() / 2;
    
    this.x = Math.floor(mid + (Math.cos(theta * Math.PI / 180) * d));
    this.y = Math.floor(mid - (Math.sin(theta * Math.PI / 180) * d));
    System.out.println("Planet: size [" + this.size + "] at[" + theta + "]degrees " + 
        "[" + (int)this.x + ", " + (int)this.y + "]");
  }
  
  public Planet(int id, double x, double y, int size) {
    super(id, x, y, size);
  }
}