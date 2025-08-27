package oop.access_modifier;

//Access modifier: protected
public class ProtectedModifier {

    protected int x;
    protected int y;

    protected void show() {
        System.out.println(x + " " + y);
    }

    private void method() {

    }

    public void methodPublic() {

    }

    final void methodFinal() {

    }
}

class SubClass extends ProtectedModifier {

    public SubClass() {
        super.x = 1;
        super.y = 2;
    }

    private void method() {

    }

    
}
