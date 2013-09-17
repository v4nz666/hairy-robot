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
  
  public void addToSandbox(Entity m) {
    _obj.add(m);
  }
  
  public void removeFromSandbox(Entity m) {
    _obj.remove(m);
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
  
  public void startSandbox() {
    if(_thread != null) return;
    _running = true;
    _thread = new Thread(this);
    _thread.start();
  }
  
  public void stopSandbox() {
    _running = false;
  }
}