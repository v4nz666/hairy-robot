package space.celestials;

import java.util.Random;

public class AsteroidBelt extends Celestial {
  @Override
  public String toString() {
    return "Belt " + super.toString();
  }
  
  private static Random _rand = new Random();
  
  private int _asteroidCount;
  
  public static AsteroidBelt generate(StarSystem system, Celestial parent, double distance, int size) {
    AsteroidBelt belt = new AsteroidBelt(system, parent, distance, size, 0, 0);
    belt._initAsteroids();
    return belt;
  }
  
  private void _initAsteroids() {
    _asteroidCount = (int)size / 250;
    double _freq = 10000;
    double _amp = this.size / 100;
    System.out.println("Freq: " + (int)_freq + " Amp: " + _amp );
    
    double th = 0;
    double asteroidSpacing = Math.PI * 2 / _asteroidCount;
    for (int i = 0; i < _asteroidCount; i++) {
      th = asteroidSpacing * i;
      
      Coord c0 = new Coord(0,0);
      int totalSize = 0;
      
      double minRadius = _rand.nextFloat() * 200;
      double smoothness = minRadius / 5;
      
      int numPoints = 10 + _rand.nextInt(15);
      double pointSpacing = Math.PI*2 / numPoints;
      Coord[] points = new Coord[numPoints];
      
      for ( int j = 0; j < numPoints; j++ ) {
        double _th =  pointSpacing * j;
        double rad = minRadius + _rand.nextDouble() * smoothness - smoothness / 2;
        double x = Math.cos(_th) * rad;
        double y = Math.sin(_th) * rad;
        totalSize = (int)(totalSize + rad);
        
        Coord c = new Coord(x, y);
        
        // Store the first Coord so we can close the circle properly
        if ( j == 0 ) {
          c0 = c;
        }
        if ( j == numPoints - 1 ) {
          c = c0;
          _th = Math.PI * 2;
        }
        points[j] = c;
      }
      
      int size = totalSize / numPoints;
      
      double d = this.size + _amp * Math.sin(_freq * th); 
      
      double jitterX = _rand.nextDouble() * 0.05 - 0.025;
      double jitterY = _rand.nextDouble() * 0.05 - 0.025;
      
      double aX = Math.cos(th + jitterX) * d; 
      double aY = Math.sin(th + jitterY) * d; 
      
      //System.out.println("Th[" + th + "]aX[" + aX + "]aY[" + aY + "]"); 
      
      this.addCelestial(Asteroid.generate(this._system, d, aX, aY, size, points));
    }
  }

  private AsteroidBelt(StarSystem system, Celestial parent, double distance, int size, float mass, int temp) {
    super(system, parent, distance, size, mass, temp);
  }
  
  @Override
  public String getType() {
    return "belt";
  }
  
  @Override
  public String getFill() {
    return null;
  }
  
  @Override
  public String getStroke() {
    return null;
  }
}