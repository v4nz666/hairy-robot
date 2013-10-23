package main;

import java.util.Random;

public class Planet extends Entity {
  private static Random _rand = new Random();
  
  private StarSystem _system;
  
  private int _mass;
  private int _distance;
  
  public Moon[] moons;
  
  public Planet(StarSystem _system, int d) {
    super(-1,0,0,0);
    this._system = _system;
    this._distance = d;
    this.size = generateSize(this);
    
    // Select a random spot in the orbit to generate our planet at
    int theta = _rand.nextInt(360);
    int mid = _system.getSize() / 2;
    
    this.x = mid + Math.cos(theta * Math.PI / 180) * d;
    this.y = mid - Math.sin(theta * Math.PI / 180) * d;
    System.out.println("Planet: size [" + this.size + "] th[" + theta + "]" + 
        "d[" + d + "]" + "x,y[" + (int)this.x + ", " + (int)this.y + "]");
    generateMoons(this);
    
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
      div = 1000;
    } else if ( scale >= 9 ) {
    // Large Planets
      div = 250;
    } else {
      div = 750;
    }
    
    return (int)((d / div) + (d / (div * 3) * _rand.nextFloat() - d/(div * 6)));
  }
  private static void generateMoons(Planet p) {
    
    int n = 1 + _rand.nextInt(Math.max(1,(p.size / 3000)));
    p._initMoons(n);
    for (int i = 0; i < n; i++) {
      p.moons[i] = new Moon(p._system, p, i + 1);
    }
  }

  private void _initMoons(int n) {
    this.moons = new Moon[n];
  }

  public int getDistance() {
    return this._distance;
  }
}