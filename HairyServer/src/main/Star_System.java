package main;

import java.util.Random;

public class Star_System {
  
  private static Random _rand = new Random();
  
  private String _name;
  private int _size;
  
  public String getName() { return _name; }
  public int getSize() { return _size; }
  
  public Planet[] _planets;
  public Star _star;
  
  public Star_System() {
    
    this._name = generateName();
    System.out.println("Generating System[" + this._name + "]");
    
    // 2^27 x 32m/coordinate ~= 1/1000 scale our Solar system, so range from half
    //  that to twice that.
    _size = (int)Math.pow(2, 26 + _rand.nextInt(3));
    System.out.println("System Size[" + (int)(_size * 32) + "m][" + _size + "px]");
    
    this._star = Star.Generate(this);
    this.generatePlanets();
  }
  
  private void generatePlanets() {
    this._planets = new Planet[_rand.nextInt(8)];
    
    int i = 1;
    int last;
    
    for (Planet p : _planets) {
      last = i;
      i = i + last;

      int d = i * (1500000 + (int)(25000 *_rand.nextFloat())); 
      
      p = new Planet(d);
      
      
    }
    
  }
  
  public String generateName() { 
    return "Sol";
    }

  

  public void set_name(String _name) {
    this._name = _name;
  }
  
}
