package space.celestials;

import java.sql.ResultSet;
import java.sql.SQLException;

public class AsteroidBelt extends Celestial {
  @Override
  public String toString() {
    return "Belt " + super.toString();
  }
  
  public AsteroidBelt(StarSystem system, Celestial parent, ResultSet r) throws SQLException {
    super(system, parent, r);
    _add = new Add();
  }
  
  public class Add extends Celestial.Add {
    public String getT() { return "b"; }
  }
}