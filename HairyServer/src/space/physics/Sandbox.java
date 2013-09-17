package space.physics;

import java.util.concurrent.ConcurrentLinkedDeque;

import main.Entity;

public class Sandbox implements Runnable {
  private Thread _thread;
  private boolean _running;
  
  private long _interval;
  private int _ticksPerSecond = 60;
  private int _tps = 60;
  
  private ConcurrentLinkedDeque<Entity> _obj = new ConcurrentLinkedDeque<>();
  private ConcurrentLinkedDeque<CollisionTracker> _collision = new ConcurrentLinkedDeque<>();
  
  public void addToSandbox(Entity m) {
    _obj.add(m);
  }
  
  public void removeFromSandbox(Entity m) {
    _obj.remove(m);
  }
  
  public void trackCollision(Class<? extends Entity> entity, Class<? extends Entity> hitBy, CollisionCallback callback) {
    _collision.add(new CollisionTracker(entity, hitBy, callback));
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
        
        for(CollisionTracker c : _collision) {
          if(c.e1.isInstance(e)) {
            for(Entity hitBy : _obj) {
              if(c.e2.isInstance(hitBy)) {
                if(checkCollisions(e, hitBy)) {
                  c.cb.hit(e, hitBy);
                }
              }
            }
          }
        }
      }
      
      if(tickTime <= System.nanoTime()) {
        _tps = ticks;
        ticks = 0;
        tickTime = System.nanoTime() + 1000000000;
        System.out.println(_tps + " ticks per second");
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
    if(a.id == b.id) return false;
    
    double dist = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    return dist < a.size / 2 + b.size / 2;
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
  
  private class CollisionTracker {
    public Class<? extends Entity> e1, e2;
    public CollisionCallback cb;
    
    public CollisionTracker(Class<? extends Entity> e1, Class<? extends Entity> e2, CollisionCallback cb) {
      this.e1 = e1;
      this.e2 = e2;
      this.cb = cb;
    }
  }
  
  public static interface CollisionCallback {
    public void hit(Entity entity, Entity hitBy);
  }
}