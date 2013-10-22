package main;

import java.util.Random;

public class Moon extends Entity{
  
  private static Random _rand = new Random(); 
  
  private StarSystem _system;
  private Planet _planet;
  private int _seq;
  
  private double th;
  
  public Moon(StarSystem s, Planet p, int seq) {
    super(-1,0,0,-1);
    this._system = s;
    this._planet = p;
    this._seq = seq;
    this._setPos();
  }

  private void _setPos() {
    this.th = 360 * _rand.nextDouble();
    int pS = this._planet.size;
    
    int d = Math.max(pS * 3, pS * this._seq) + (pS * this._seq / 2);
    
    this.x = this._planet.x + Math.cos(th * (Math.PI / 2)) * d;
    this.y = this._planet.y + Math.sin(th * (Math.PI / 2)) * d;
    
    int minSize = (int)(512 + (_rand.nextDouble() * 100 - 50)); 
    this.size = Math.max(minSize, _rand.nextInt(this._planet.size / 8));
    System.out.println("pS[" + pS + "] _s[" + this._seq + "] d[" + d + "] size[" + this.size + "]");
  }
}
