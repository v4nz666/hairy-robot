package space.data.guns;

import java.util.LinkedHashMap;
import java.util.Random;

public abstract class Gun {
  private static Random _rand = new Random();
  private static LinkedHashMap<String, Gun> _registry = new LinkedHashMap<>();
  private static Gun _default;
  public static void init() {
    _default = MachineGun.instance();
    _registry.put(MachineGun.class.getName(),     MachineGun.instance());
    _registry.put(RocketLauncher.class.getName(), RocketLauncher.instance());
  }
  
  public static Gun getGunDefault() {
    return _default;
  }
  
  public static Gun getGunRandom() {
    int i = 0, r = _rand.nextInt(_registry.size());
    for(Gun c : _registry.values()) {
      if(i++ == r) return c;
    }
    
    return getGunDefault();
  }
  
  public abstract String getName();
  public abstract Bullet[] getBullets();
  public abstract int getBarrels();
  public abstract float getBarrelSpread();
  public abstract float getBulletDeviation();
  
  public static class MachineGun extends Gun {
    private static MachineGun _instance = new MachineGun();
    public static MachineGun instance() { return _instance; }
    private MachineGun() { }
    
    @Override public String getName() { return "Light Anti-Spacecraft Gun"; }
    @Override public Bullet[] getBullets() { return new Bullet[] { Bullet.MachineGun.Standard.instance() }; }
    @Override public int getBarrels() { return 2; }
    @Override public float getBarrelSpread() { return 45; }
    @Override public float getBulletDeviation() { return 0; }
  }
  
  public static class RocketLauncher extends Gun {
    private static RocketLauncher _instance = new RocketLauncher();
    public static RocketLauncher instance() { return _instance; }
    private RocketLauncher() { }
    
    @Override public String getName() { return "Rocket Launcher"; }
    @Override public Bullet[] getBullets() { return new Bullet[] { Bullet.RocketLauncher.Standard.instance() }; }
    @Override public int getBarrels() { return 6; }
    @Override public float getBarrelSpread() { return 6; }
    @Override public float getBulletDeviation() { return 0; }
  }
}