import java.io.*;

public class Example_CF
{
    public static void main(final String[] args) throws IOException {
    int a, b, c, d, e, f, g, h, i, j;
	a = 1;
	// constant propagation
	b = a; 		// -> b = 1
	
	// unary propagation
	c = -a; 	// -> c = -1
	
	// addition
	d = 4 + a;	// -> d = 5

	// subtraction
	e = d - c;	// -> e = 6 
	
	// multiplication
	g =  e * d; 	// -> g = 30
	h = g * -1; 	// -> h = -30
	
	// division
	
	i = h / -2; 	// -> i = 15
	j = e / g; 	// -> j = 0
    }
 
}


