package main;

import java.util.Random;

public class StarSystem {
  
  private static Random _rand = new Random();
  private static int _planetCount = 0;
  private static int _asteroidCount = 0;
  private String _name;
  private int _size;
  
  public String getName() { return _name; }
  public int getSize() { return _size; }
  
  public Planet[] planets;
  public AsteroidBelt[] asteroidBelts;
  
  public Star star;
  
  public StarSystem() {
    
    this._name = generateName();
    System.out.println("Generating System[" + this._name + "]");
    
    // 290759680 x 32m/coordinate ~= 1/1000 scale our Solar system
    _size = 512 * 567890;
    System.out.println("System Size[" + (long)_size * 32 + "m][" + _size + "px]");
    
    this.star = Star.Generate(this);
    this.initOrbits();
  }
  /**
   * Generate our Orbits at distances defined by the Fibonacci sequence: 
   *  1,2,3,5,8,13,21,34,55,89,144.
   */
   private void initOrbits() {
    this.planets = new Planet[9];
    this.asteroidBelts = new AsteroidBelt[2];
    
    int fib = 1;
    int i;
    
    // Distance of the outermost orbit (1000000km from the outer edge)
    int maxD = (this._size / 2) - 1000000;
    
    // Our Fibonacci sequence
    int[] seq = new int[planets.length + asteroidBelts.length];
    
    for (i = 0; i < seq.length; i++) {
      seq[i] = fib;
      fib = ( i > 0 ) ? fib + seq[i-1] : fib + 1;
    }
    
    // Divide the total System size into the number of divisions defined by the largest(last) 
    //  number in the sequence
    int div = maxD / seq[seq.length - 1];
    for (i = 0; i < planets.length; i++) {
      int d = div * seq[i];
      if ( i != 3 ) {
        this.generatePlanet(d);
      } else {
        this.generateAsteroidBelt(d);
      }
    }
  }
  
  /**
   * @param div, seq
   */
  private void generatePlanet(int d) {
    planets[_planetCount++] = new Planet(this, d);
  }
  
  private void generateAsteroidBelt(int d) {
    asteroidBelts[_asteroidCount++] = new AsteroidBelt(this, d);
  }
  public String generateName() { 
    return "Sol";
  }
  
  public void set_name(String _name) {
    this._name = _name;
  }
  
}
