package space.data.guns;

public abstract class Gun {
  public abstract String getName();
  public abstract Bullet[] getBullets();
  public abstract long getReloadTime();
  
  public static class MachineGun extends Gun {
    private static MachineGun _instance = new MachineGun();
    public static MachineGun instance() { return _instance; }
    private MachineGun() { }
    
    @Override public String getName() { return "Light Anti-Spacecraft Gun"; }
    @Override public Bullet[] getBullets() { return new Bullet[] { Bullet.MachineGun.Standard.instance() }; }
    @Override public long getReloadTime() { return 3000000000l; }
  }
}