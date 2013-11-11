package space.celestials;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import space.Ship;
import space.physics.Sandbox;
import sql.SQL;

public class StarSystem implements Runnable {
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
  
  private Thread _thread;
  private boolean _running;
  private int _tps = 60;
  
  private Sandbox _sandbox = new Sandbox();
  
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
    
    for(Ship ship : _ship) {
      _sandbox.addToSandbox(ship);
    }
    
    System.out.println("Generating System[" + _name + "]");
    
    // 290759680 x 32m/coordinate ~= 1/1000 scale our Solar system
    _size = 512 * 567890;
    System.out.println("System Size[" + (long)_size * 32 + "m][" + _size + "px]");
    
    star = Star.generate(this, null, 0);
    initOrbits();
    
    _running = true;
    _thread = new Thread(this);
    _thread.start();
    _sandbox.startSandbox();
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
  
  public void run() {
    int interval = 1000000000 / 60;
    _running = true;
    
    long time, timeDelta = interval;
    int ticks = 0;
    long tickTime = System.nanoTime() + 1000000000;
    
    while(_running) {
      time = System.nanoTime();
      
      tick(timeDelta / interval);
      
      // Track FPS
      if(tickTime <= System.nanoTime()) {
        _tps = ticks;
        ticks = 0;
        tickTime = System.nanoTime() + 1000000000;
        //System.out.println(_tps + " ticks per second");
      }
      
      ticks++;
      
      // Sleep each loop if we have extra time
      timeDelta = System.nanoTime() - time;
      long timeSleep = interval - timeDelta;
      long timeDeltaMS = timeSleep / 1000000;
      int timeDeltaNS = (int)(timeSleep - timeDeltaMS * 1000000);
      if(timeSleep > 0) {
        try { Thread.sleep(timeDeltaMS, timeDeltaNS); } catch(InterruptedException e) { }
      }
    }
  }
  
  private void tick(double deltaT) {
    for(Ship ship : _ship) {
      ship.sendUpdate(_sandbox.getUpdates());
    }
  }
}