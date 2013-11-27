package space.physics;

import java.util.Iterator;
import java.util.concurrent.ConcurrentLinkedDeque;

public class Sandbox implements Runnable, Iterable<Entity> {
  private Thread _thread;
  private boolean _running;
  
  private long _interval;
  private int _ticksPerSecond = 60;
  private int _tps = 60;
  
  private ConcurrentLinkedDeque<Entity> _obj = new ConcurrentLinkedDeque<>();
  private ConcurrentLinkedDeque<CollisionTracker<? extends Entity, ? extends Entity>> _collision = new ConcurrentLinkedDeque<>();
  
  public int tps() { return _tps; }
  
  public void addToSandbox(Entity m) {
    _obj.add(m);
  }
  
  public void removeFromSandbox(Entity m) {
    _obj.remove(m);
  }
  
  public <T extends Entity, U extends Entity> void trackCollision(Class<T> entity, Class<U> hitBy, CollisionCallback<T, U> callback) {
    _collision.add(new CollisionTracker<T, U>(entity, hitBy, callback));
  }
  
  public Entity getEntity(int id) {
    for(Entity e : _obj) {
      if(e.id == id) {
        return e;
      }
    }
    
    return null;
  }
  
  public void run() {
    _interval = 1000000000l / _ticksPerSecond;
    _running = true;
    
    long time, timeDelta = _interval;
    int ticks = 0;
    long tickTime = System.nanoTime() + 1000000000l;
    
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
        tickTime = System.nanoTime() + 1000000000l;
        //System.out.println(_tps + " ticks per second");
      }
      
      ticks++;
      
      // Sleep each loop if we have extra time
      timeDelta = System.nanoTime() - time;
      long timeSleep = _interval - timeDelta;
      long timeDeltaMS = timeSleep / 1000000l;
      int timeDeltaNS = (int)(timeSleep - timeDeltaMS * 1000000l);
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
  
  public void join() throws InterruptedException {
    _thread.join();
  }
  
  public boolean isAlive() {
    return _thread != null && _thread.isAlive();
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
  
  @Override
  public Iterator<Entity> iterator() {
    return _obj.iterator();
  }
}
