package main;

import java.util.Random;

public class StarSystem {
  
  private static Random _rand = new Random();
  
  private String _name;
  private int _size;
  
  public String getName() { return _name; }
  public int getSize() { return _size; }
  
  public Planet[] planets;
  public Star star;
  
  public StarSystem() {
    
    this._name = generateName();
    System.out.println("Generating System[" + this._name + "]");
    
    // 290759680 x 32m/coordinate ~= 1/1000 scale our Solar system
    _size = 512 * 567890;
    System.out.println("System Size[" + (long)_size * 32 + "m][" + _size + "px]");
    
    this.star = Star.Generate(this);
    this.generatePlanets();
  }
  
  /**
   * Generate our Planets at distances defined by the Fibonacci sequence: 
   *  1,2,3,5,8,13,21,34,55,89.
   *  
   * We'll be skipping the Planet that would be at "5", and replacing it with an
   * Asteroid Belt
   */
  private void generatePlanets() {
    this.planets = new Planet[9];
    
    int fib = 1;
    int i, j;
    // Distance of the farthest planet (1000000km from the outer edge)
    int maxD = (this._size / 2) - 1000000;
    
    // Our Fibonacci sequence
    int[] seq = new int[planets.length + 1];
    
    // +1 for asteroid belt 
    for (i = 0; i < planets.length + 1; i++) {
      seq[i] = fib;
      fib = ( i > 0 ) ? fib + seq[i - 1] : fib + 1;
    }
    
    int div = maxD / seq[seq.length -1];
    
    for (i = 0; i < planets.length; i++) {
      
      // Use j, so we can leave a gap for the Asteroid belt where planet[3] would be
      j = i <= 2 ? i : i + 1;
      
      int d = div * seq[j]; 
      planets[i] = new Planet(this, d);
    }
  }
  
  public String generateName() { 
    return "Sol";
  }
  
  public void set_name(String _name) {
    this._name = _name;
  }
  
}
