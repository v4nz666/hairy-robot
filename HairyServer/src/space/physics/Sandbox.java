package space.physics;

import java.util.concurrent.ConcurrentLinkedDeque;

import space.celestials.Celestial;
public class Sandbox implements Runnable {
  private Thread _thread;
  private boolean _running;
  
  private long _interval;
  private int _ticksPerSecond = 60;
  private int _tps = 60;
  
  private ConcurrentLinkedDeque<Entity> _obj = new ConcurrentLinkedDeque<>();
  private ConcurrentLinkedDeque<CollisionTracker<? extends Entity, ? extends Entity>> _collision = new ConcurrentLinkedDeque<>();
  
  public int tps() { return _tps; }
  
  public void addToSandbox(Entity m) {
    Celestial p = (Celestial)m;
    if ( p instanceof Celestial ) {
      Celestial[] children = p.getCelestial();
      if ( children.length > 0 ) {
        for (int i = 0; i < children.length; i++) {
          this.addToSandbox(children[i]);
        }
      } else {
        _obj.add(p);
      }
    } else {
      _obj.add(m);
    }
  }
  
  public void removeFromSandbox(Entity m) {
    _obj.remove(m);
  }
  
  public <T extends Entity, U extends Entity> void trackCollision(Class<T> entity, Class<U> hitBy, CollisionCallback<T, U> callback) {
    _collision.add(new CollisionTracker<T, U>(entity, hitBy, callback));
  }
  
  public void run() {
    _interval = 1000000000 / _ticksPerSecond;
    _running = true;
    
    long time, timeDelta = _interval;
    int ticks = 0;
    long tickTime = System.nanoTime() + 1000000000;
    
    while(_running) {
      time = System.nanoTime();
      
      for(Entity e : _obj) {
        e.update(timeDelta / _interval);
        
        for(CollisionTracker<? extends Entity, ? extends Entity> c : _collision) {
          c.check(e);
        }
      }
      
      if(tickTime <= System.nanoTime()) {
        _tps = ticks;
        ticks = 0;
        tickTime = System.nanoTime() + 1000000000;
        System.out.println("Sandbox: " + _tps + " ticks per second.");
      }
      
      ticks++;
      
      // Sleep each loop if we have extra time
      timeDelta = System.nanoTime() - time;
      long timeSleep = _interval - timeDelta;
      long timeDeltaMS = timeSleep / 1000000;
      int timeDeltaNS = (int)(timeSleep - timeDeltaMS * 1000000);
      if(timeSleep > 0) {
        try { Thread.sleep(timeDeltaMS, timeDeltaNS); } catch(InterruptedException e) { e.printStackTrace(); }
      }
    }
  }
  
  private boolean checkCollisions(Entity a, Entity b) {
    // Can't collide with yourself, or bullets you've fired
    if(a.spawnID == b.spawnID) return false;
    
    double dist = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    if(dist < a.size + b.size) {
      b.x -= b.vx;
      b.y -= b.vy;
      
      double mv = b.maxVel;
      b.maxVel = dist - b.size;
      b.clampVels();
      b.displace();
      b.maxVel = mv;
      
      return true;
    }
    
    return false;
  }
  
  public void startSandbox() {
    if(_thread != null) return;
    _running = true;
    _thread = new Thread(this);
    _thread.start();
  }
  
  public void stopSandbox() {
    _running = false;
  }
  
  private class CollisionTracker<T extends Entity, U extends Entity> {
    public Class<T> e1;
    public Class<U> e2;
    public CollisionCallback<T, U> cb;
    
    public CollisionTracker(Class<T> e1, Class<U> e2, CollisionCallback<T, U> cb) {
      this.e1 = e1;
      this.e2 = e2;
      this.cb = cb;
    }
    
    @SuppressWarnings("unchecked")
    public void check(Entity e) {
      if(e1.isInstance(e)) {
        for(Entity hitBy : _obj) {
          if(e2.isInstance(hitBy)) {
            if(checkCollisions(e, hitBy)) {
              cb.hit((T)e, (U)hitBy);
            }
          }
        }
      }
    }
  }
  
  public static interface CollisionCallback<T extends Entity, U extends Entity> {
    public void hit(T entity, U hitBy);
  }
}
