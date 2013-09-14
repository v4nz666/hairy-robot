package main;

import java.util.LinkedHashMap;
import java.util.Random;

public abstract class Gun {
  private static Random _rand = new Random();
  private static LinkedHashMap<String, Class<? extends Gun>> _registry = new LinkedHashMap<>();
  private static Class<? extends Gun> _default;
  public static void init() {
    _default = PointDefenseTurret.class;
    _registry.put(PointDefenseTurret.class.getName(), PointDefenseTurret.class);
    _registry.put(RocketTurret.class.getName(),       RocketTurret.class);
  }
  
  public static Gun getGunDefault() {
    return createGun(_default);
  }
  
  public static Gun getGunByName(String name) {
    return createGun(_registry.get(name));
  }
  
  public static Gun getGunRandom() {
    System.out.println(_registry.size());
    int i = 0, r = _rand.nextInt(_registry.size());
    for(Class<? extends Gun> c : _registry.values()) {
      if(i++ == r) return createGun(c);
    }
    
    return new PointDefenseTurret();
  }
  
  private static Gun createGun(Class<? extends Gun> gun) {
    if(gun != null) {
      try {
        return gun.newInstance();
      } catch(InstantiationException | IllegalAccessException e) {
        e.printStackTrace();
      }
    }
    
    return new PointDefenseTurret();
  }
  
  protected Server _server = Server.instance();
  protected long _lastBullet;
  protected long _bulletsLeft;
  
  private Gun() {
    _bulletsLeft = getClipSize();
  }
  
  public abstract String getName();
  public abstract int   getClipSize();
  public abstract int   getBarrels();
  public abstract float getBarrelSpread();
  public abstract long  getRepeatTime();
  public abstract long  getReloadTime();
  protected abstract Bullet createBullet(User user, float offset);
  public void fire(User user) {
    if(_lastBullet <= System.nanoTime()) {
      float center = -getBarrels() / 2;
      float offset = center * getBarrelSpread();
      
      for(int i = 0; i < getBarrels(); i++) {
        _server.addBullet(createBullet(user, offset));
        offset += getBarrelSpread();
      }
      
      _bulletsLeft--;
      if(_bulletsLeft > 0) {
        _lastBullet = System.nanoTime() + getRepeatTime();
      } else {
        _lastBullet = System.nanoTime() + getReloadTime();
        _bulletsLeft = getClipSize();
      }
    }
  }
  
  public static class PointDefenseTurret extends Gun {
    @Override public String getName()      { return "Point Defense Turret"; }
    @Override public int   getClipSize()     { return 3; }
    @Override public int   getBarrels()      { return 3; }
    @Override public float getBarrelSpread() { return 1; }
    @Override public long  getRepeatTime()   { return 100000000; }
    @Override public long  getReloadTime()   { return 300000000; }
    @Override protected Bullet createBullet(User user, float offset) {
      return new Bullet(user, offset, 2, 12, 12, 10);
    }
  }
  
  public static class RocketTurret extends Gun {
    @Override public String getName()      { return "Rocket Turret"; }
    @Override public int   getClipSize()     { return 1; }
    @Override public int   getBarrels()      { return 1; }
    @Override public float getBarrelSpread() { return 0; }
    @Override public long  getRepeatTime()   { return 300000000; }
    @Override public long  getReloadTime()   { return 300000000; }
    @Override protected Bullet createBullet(User user, float offset) {
      return new Bullet(user, offset, 5, 0, 20, 50);
    }
  }
}