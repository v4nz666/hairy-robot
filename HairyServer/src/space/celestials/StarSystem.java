package space.celestials;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import space.models.Faction;
import space.models.Ship;
import space.physics.Entity;
import space.physics.Sandbox;
import sql.SQL;

public class StarSystem implements Runnable {
  private static SQL sql = SQL.getInstance();
  private static PreparedStatement select = sql.prepareStatement("SELECT * FROM `systems`");
  
  public static ArrayList<StarSystem> load() throws SQLException {
    try(ResultSet r = select.executeQuery()) {
      ArrayList<StarSystem> system = new ArrayList<>();
      
      while(r.next()) {
        system.add(new StarSystem(r));
      }
      
      return system;
    }
  }
  
  private int _id = -1;
  public int nextID() { return _id--; }
  
  private Thread _thread;
  private boolean _running;
  private int _tps = 60;
  
  private long _celestialTimer;
  
  private Sandbox _sandbox = new Sandbox();
  
  public final int id;
  
  private String _name;
  private double _size;
  
  public String getName() { return _name; }
  public double getSize() { return _size; }
  
  public Celestial star;

  private ArrayList<Faction> _faction = new ArrayList<>();
  private ArrayList<Ship>    _ship = new ArrayList<>();
  
  public Faction getFaction(int id) {
    for(Faction faction : _faction) {
      if(faction.id == id) {
        return faction;
      }
    }
    
    return null;
  }
  
  private StarSystem(ResultSet r) throws SQLException {
    id = r.getInt("id");
    _name = r.getString("name");
    _size = r.getInt("size");
    
    _faction = Faction.load(this);
    _ship    = Ship.load(this);
    
    for(Ship ship : _ship) {
      _sandbox.addToSandbox(ship);
    }
    
    System.out.println("Generating System[" + _name + "]");
    
    // 290759680 x 32m/coordinate ~= 1/1000 scale our Solar system
    System.out.println("System Size[" + (long)_size * 32 + "m][" + _size + "px]");
    
    star = Celestial.load(this).get(0);
    
    star.addToSandbox(_sandbox);
    
    _running = true;
    _thread = new Thread(this);
    _thread.start();
    _sandbox.startSandbox();
  }
  
  public void stop() {
    _sandbox.stopSandbox();
    
    while(_sandbox.isAlive()) {
      try {
        _sandbox.join();
      } catch(InterruptedException e) {
        e.printStackTrace();
      }
    }
    
    _running = false;
  }
  
  public void join() throws InterruptedException {
    _thread.join();
  }
  
  public boolean isAlive() {
    return _thread != null && _thread.isAlive();
  }
  
  public void sendEntities(Ship ship, Entity.Request request) {
    for(int i = 0; i < request.i.length; i++) {
      Entity e = _sandbox.getEntity(request.i[i]);
      if(e != null) {
        ship.sendEntity(e.serializeAdd());
      }
    }
  }
  
  public void sendCelestials(Ship ship, Entity.Request request) {
    for(int i = 0; i < request.i.length; i++) {
      Entity e = _sandbox.getEntity(request.i[i]);
      if(e != null) {
        ship.sendCelestial(e.serializeAdd());
      }
    }
  }
  
  public Ship findShip(int id) {
    for(Ship ship : _ship) {
      if(ship.id == id) {
        return ship;
      }
    }
    
    return null;
  }
  
  public void run() {
    int interval = 1000000000 / 60;
    _running = true;
    
    long time, timeDelta = interval;
    int ticks = 0;
    long tickTime = System.nanoTime() + 1000000000l;
    
    while(_running) {
      time = System.nanoTime();
      
      tick(timeDelta / interval);
      
      // Track FPS
      if(tickTime <= System.nanoTime()) {
        _tps = ticks;
        ticks = 0;
        tickTime = System.nanoTime() + 1000000000l;
        //System.out.println(_tps + " ticks per second");
      }
      
      ticks++;
      
      // Sleep each loop if we have extra time
      timeDelta = System.nanoTime() - time;
      long timeSleep = interval - timeDelta;
      long timeDeltaMS = timeSleep / 1000000l;
      int timeDeltaNS = (int)(timeSleep - timeDeltaMS * 1000000);
      if(timeSleep > 0) {
        try { Thread.sleep(timeDeltaMS, timeDeltaNS); } catch(InterruptedException e) { }
      }
    }
  }
  
  private void tick(double deltaT) {
    for(Ship ship : _ship) {
      if(ship.user() != null) {
        ship.updateList.clear();
        
        for(Entity e : _sandbox) {
          if(!(e instanceof Celestial)) {
            if(ship.isNear(e)) {
              ship.updateList.add(e.serializeUpdate());
            }
          }
        }
        
        ship.sendUpdate(ship.updateList.toArray(new Entity.Update[0]));
      }
    }
    
    if(_celestialTimer <= System.nanoTime()) {
      for(Ship ship : _ship) {
        if(ship.user() != null) {
          ship.celestList.clear();
          
          for(Entity e : _sandbox) {
            if(e instanceof Celestial) {
              if(ship.isNear(e)) {
                ship.celestList.add(e.serializeUpdate());
              }
            }
          }
          
          ship.sendCelestials(ship.celestList.toArray(new Entity.Update[0]));
        }
      }
      
      _celestialTimer = System.nanoTime() + 1000000000l;
    }
  }
}