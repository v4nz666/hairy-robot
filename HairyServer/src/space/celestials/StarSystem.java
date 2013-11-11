package space.celestials;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import space.Ship;
import sql.SQL;

public class StarSystem {
  private static SQL sql = SQL.getInstance();
  private static PreparedStatement select = sql.prepareStatement("SELECT * FROM `systems`");
  
  public static ArrayList<StarSystem> load() throws SQLException {
    try(ResultSet r = select.executeQuery()) {
      ArrayList<StarSystem> system = new ArrayList<>();
      
      while(r.next()) {
        system.add(new StarSystem(r.getInt("id")));
      }
      
      return system;
    }
  }
  
  public final int id;
  
  private String _name;
  private double _size;
  
  public String getName() { return _name; }
  public double getSize() { return _size; }
  
  public Star star;
  
  private ArrayList<Ship> _ship = new ArrayList<>();
  
  private StarSystem(int id) throws SQLException {
    this.id = id;
    
    _name = generateName();
    _ship = Ship.load(this);
    
    System.out.println("Generating System[" + _name + "]");
    
    // 290759680 x 32m/coordinate ~= 1/1000 scale our Solar system
    _size = 512 * 567890;
    System.out.println("System Size[" + (long)_size * 32 + "m][" + _size + "px]");
    
    star = Star.generate(this, null, 0);
    initOrbits();
  }
  
  public Ship findShip(int id) {
    for(Ship ship : _ship) {
      if(ship.id == id) {
        return ship;
      }
    }
    
    return null;
  }
  
  /**
   * Generate our Orbits at distances defined by the Fibonacci sequence: 
   *  1,2,3,5,8,13,21,34,55,89,144.
   */
  private void initOrbits() {
    int count = 12;
    
    int fib = 1;
    int i;
    
    // Distance of the outermost orbit (1000000km from the outer edge)
    double maxD = (_size / 2) - 1000000;
    
    // Our Fibonacci sequence
    int[] seq = new int[count];
    
    for(i = 0; i < seq.length; i++) {
      seq[i] = fib;
      fib = (i > 0) ? fib + seq[i - 1] : fib + 1;
    }
    
    // Divide the total System size into the number of divisions
    // defined by the largest(last) number in the sequence
    double div = maxD / seq[seq.length - 1];
    for(i = 0; i < count; i++) {
      double d = div * seq[i];
      if(i != 3) {
        star.addCelestial(Planet.generate(this, star, d));
      } else {
        star.addCelestial(AsteroidBelt.generate(this, star, 0, (int)d));
      }
    }
  }
  
  public String generateName() { 
    return "Sol";
  }
}