package main;

import java.util.Random;

public class Star_System {
  
  private static Random _rand = new Random();
  
  private String _name;
  private int _size;
  
  public String getName() { return _name; }
  public int getSize() { return _size; }
  
  public Planet[] planets;
  public Star star;
  
  public Star_System() {
    
    this._name = generateName();
    System.out.println("Generating System[" + this._name + "]");
    
    // 2^27 x 32m/coordinate ~= 1/1000 scale our Solar system
    _size = (int)Math.pow(2, 27);
    System.out.println("System Size[" + (long)_size * 32 + "m][" + _size + "px]");
    
    this.star = Star.Generate(this);
    this.generatePlanets();
  }
  
  private void generatePlanets() {
    this.planets = new Planet[9];
    
    int fib = 1;
    int last;
    
    int[] seq = new int[planets.length];
    
    for (int i = 0; i < planets.length; i++) {
      seq[i] = fib;
      
      last = fib;
      fib = fib + last;
    }
    int maxD = (this._size / 2) - 1000000;
    System.out.println("Max Distance[" + maxD + "]");
    
    int div = maxD / seq[seq.length -1];
    
    System.out.println("Division size[" + div + "]");
    
    for (int i = 0; i < planets.length; i++) {
      
      int d = div * seq[i]; 
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
