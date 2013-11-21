package space.ai.component;

public class Logger extends Component {
  public Component.Value<?> in;
  
  public Component.Execution log = new Component.Execution() {
    @Override
    public void execute() {
      //System.out.println((int)((Character)in.value()).charValue());
    }
  };
}