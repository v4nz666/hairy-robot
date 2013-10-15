package main;

import java.util.Random;

public class Planet extends Entity {
  private static Random _rand = new Random();
  
  private Star_System _system;
  
  private int _mass;
  private int _distance;
  
  private Moon[] _moons;
  
  public Planet(Star_System _system, int d) {
    super(-1,0,0,0);
    this._system = _system;
    this._distance = d;
    this.size = generateSize(this);
    
    System.out.println("Generating Planet at distance [" + d + "]");
    
    // Select a random spot in the orbit to generate our planet at
    int theta = _rand.nextInt(360);
    int mid = _system.getSize() / 2;
    
    this.x = Math.floor(mid + (Math.cos(theta * Math.PI / 180) * d));
    this.y = Math.floor(mid - (Math.sin(theta * Math.PI / 180) * d));
    System.out.println("Planet: size [" + this.size + "] at[" + theta + "]degrees " + 
        "[" + (int)this.x + ", " + (int)this.y + "]");
    this._moons = generateMoons(this);
    
  }
  
  private static int generateSize(Planet p) {
    
    int scale = _rand.nextInt(10);
    int div;
    int d = p._distance;
    int sSize = p._system.getSize();
    // Constrain d so that inner/outer planets stay a reasonable size
    d = Math.max(Math.min(d, sSize / 15), sSize / 100);
    
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
  private static Moon[] generateMoons(Planet p) {
    // TODO Auto-generated method stub
    return null;
  }

}