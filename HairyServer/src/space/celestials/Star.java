package space.celestials;

import java.sql.ResultSet;
import java.sql.SQLException;

public class Star extends Celestial {
  @Override
  public String toString() {
    return "Star " + super.toString();
  }
  
  public double getMass() { return _mass; }
  public double getTemp() { return _temp; }
  
  public Star(StarSystem system, Celestial parent, ResultSet r) throws SQLException {
    super(system, parent, r);
    _add = new Add();
  }
  
  public class Add extends Celestial.Add {
    public String getFill() { return "yellow"; }
  }
}