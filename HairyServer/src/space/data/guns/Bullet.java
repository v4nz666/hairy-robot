package space.data.guns;

public abstract class Bullet {
  public abstract int getDamage();
  public abstract int getRange();
  public abstract float getHeatGen();
  
  public static interface Ammo {
    public String getName();
    public int getCost();
    public int getLVL();
    public int getClipSize();
  }
  
  public static interface Ballistic {
    public float getAcc();
    public float getVel();
    public float getMaxVel();
    public long getROF();
  }
  
  public static interface Energy {
    public abstract float getEnergyUse();
  }
  
  public static class MachineGun {
    public static class Standard extends Bullet implements Ammo, Ballistic {
      private static Standard _instance = new Standard();
      public static Standard instance() { return _instance; }
      private Standard() { }
      
      @Override public String getName()       { return "200mm Light Anti-Spacecraft Rounds"; }
      @Override public int    getCost()       { return 0; }
      @Override public int    getLVL()        { return 0; }
      @Override public int    getClipSize()   { return 60; }
      @Override public int    getDamage()     { return 5; }
      @Override public int    getRange()      { return 200; }
      @Override public float  getHeatGen()    { return 2; }
      @Override public float  getAcc()        { return 0; }
      @Override public float  getVel()        { return 20; }
      @Override public float  getMaxVel()     { return 20; }
      @Override public long   getROF()        { return 250000000l; }
    }
  }
  
  public static class PlasmaTurret {
    public static class Standard extends Bullet implements Ballistic, Energy {
      private static Standard _instance = new Standard();
      public static Standard instance() { return _instance; }
      private Standard() { }
      
      @Override public int   getDamage()    { return 50; }
      @Override public int   getRange()     { return 300; }
      @Override public float getHeatGen()   { return 50; }
      @Override public float getAcc()       { return 0; }
      @Override public float getVel()       { return 10; }
      @Override public float getMaxVel()    { return 10; }
      @Override public long  getROF()       { return 1000000000l; }
      @Override public float getEnergyUse() { return 50; }
    }
  }
}