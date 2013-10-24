package space.celestials;

import java.util.Random;

public class Moon extends Celestial {
  private static Random _rand = new Random(); 
  
  private Planet _planet;
  
  private double th;
  
  public Moon(StarSystem s, Planet p, int seq) {
    super(0, 0, -1);
    _system = s;
    _planet = p;
    
    th = 360 * _rand.nextDouble();
    int pS = _planet.size;
    
    int d = Math.max(pS * 3, pS * seq) + (pS * seq / 2);
    
    x = _planet.x + Math.cos(th * (Math.PI / 2)) * d;
    y = _planet.y + Math.sin(th * (Math.PI / 2)) * d;
    
    int minSize = (int)(512 + (_rand.nextDouble() * 100 - 50)); 
    this.size = Math.max(minSize, _rand.nextInt(_planet.size / 8));
    System.out.println("pS[" + pS + "] d[" + d + "] size[" + size + "]");
  }
}