import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ruler } from 'lucide-react';

const SizeGuide: React.FC = () => {
  return (
    <Layout>
      <div className="container py-12 max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Ruler className="h-12 w-12 text-rose-600" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">Size Guide</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find your perfect fit with our comprehensive size charts
          </p>
        </div>

        <Tabs defaultValue="women" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="women">Women</TabsTrigger>
            <TabsTrigger value="men">Men</TabsTrigger>
            <TabsTrigger value="kids">Kids</TabsTrigger>
          </TabsList>

          <TabsContent value="women" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold mb-4">Women's Clothing</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Bust (inches)</TableHead>
                        <TableHead>Waist (inches)</TableHead>
                        <TableHead>Hips (inches)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">XS</TableCell>
                        <TableCell>30-32</TableCell>
                        <TableCell>24-26</TableCell>
                        <TableCell>34-36</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">S</TableCell>
                        <TableCell>32-34</TableCell>
                        <TableCell>26-28</TableCell>
                        <TableCell>36-38</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">M</TableCell>
                        <TableCell>34-36</TableCell>
                        <TableCell>28-30</TableCell>
                        <TableCell>38-40</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">L</TableCell>
                        <TableCell>36-38</TableCell>
                        <TableCell>30-32</TableCell>
                        <TableCell>40-42</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">XL</TableCell>
                        <TableCell>38-40</TableCell>
                        <TableCell>32-34</TableCell>
                        <TableCell>42-44</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">XXL</TableCell>
                        <TableCell>40-42</TableCell>
                        <TableCell>34-36</TableCell>
                        <TableCell>44-46</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold mb-4">Saree Blouse Sizes</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Bust (inches)</TableHead>
                        <TableHead>Shoulder (inches)</TableHead>
                        <TableHead>Sleeve Length (inches)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">32</TableCell>
                        <TableCell>32</TableCell>
                        <TableCell>14.5</TableCell>
                        <TableCell>12</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">34</TableCell>
                        <TableCell>34</TableCell>
                        <TableCell>15</TableCell>
                        <TableCell>12.5</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">36</TableCell>
                        <TableCell>36</TableCell>
                        <TableCell>15.5</TableCell>
                        <TableCell>13</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">38</TableCell>
                        <TableCell>38</TableCell>
                        <TableCell>16</TableCell>
                        <TableCell>13.5</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">40</TableCell>
                        <TableCell>40</TableCell>
                        <TableCell>16.5</TableCell>
                        <TableCell>14</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="men" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold mb-4">Men's Clothing</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Chest (inches)</TableHead>
                        <TableHead>Waist (inches)</TableHead>
                        <TableHead>Shoulder (inches)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">S</TableCell>
                        <TableCell>36-38</TableCell>
                        <TableCell>28-30</TableCell>
                        <TableCell>16-17</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">M</TableCell>
                        <TableCell>38-40</TableCell>
                        <TableCell>30-32</TableCell>
                        <TableCell>17-18</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">L</TableCell>
                        <TableCell>40-42</TableCell>
                        <TableCell>32-34</TableCell>
                        <TableCell>18-19</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">XL</TableCell>
                        <TableCell>42-44</TableCell>
                        <TableCell>34-36</TableCell>
                        <TableCell>19-20</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">XXL</TableCell>
                        <TableCell>44-46</TableCell>
                        <TableCell>36-38</TableCell>
                        <TableCell>20-21</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold mb-4">Men's Trousers/Jeans</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Waist Size</TableHead>
                        <TableHead>Waist (inches)</TableHead>
                        <TableHead>Inseam (inches)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">28</TableCell>
                        <TableCell>28-29</TableCell>
                        <TableCell>30-32</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">30</TableCell>
                        <TableCell>30-31</TableCell>
                        <TableCell>30-32</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">32</TableCell>
                        <TableCell>32-33</TableCell>
                        <TableCell>32-34</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">34</TableCell>
                        <TableCell>34-35</TableCell>
                        <TableCell>32-34</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">36</TableCell>
                        <TableCell>36-37</TableCell>
                        <TableCell>32-34</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kids" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-2xl font-semibold mb-4">Kids' Clothing (Boys & Girls)</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age</TableHead>
                        <TableHead>Height (inches)</TableHead>
                        <TableHead>Chest (inches)</TableHead>
                        <TableHead>Waist (inches)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">2-3 Years</TableCell>
                        <TableCell>35-38</TableCell>
                        <TableCell>21-22</TableCell>
                        <TableCell>20-21</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">4-5 Years</TableCell>
                        <TableCell>39-42</TableCell>
                        <TableCell>22-23</TableCell>
                        <TableCell>21-22</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">6-7 Years</TableCell>
                        <TableCell>43-46</TableCell>
                        <TableCell>23-24</TableCell>
                        <TableCell>22-23</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">8-9 Years</TableCell>
                        <TableCell>47-50</TableCell>
                        <TableCell>25-26</TableCell>
                        <TableCell>23-24</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">10-11 Years</TableCell>
                        <TableCell>51-54</TableCell>
                        <TableCell>27-28</TableCell>
                        <TableCell>24-25</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">12-14 Years</TableCell>
                        <TableCell>55-60</TableCell>
                        <TableCell>29-31</TableCell>
                        <TableCell>25-27</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-rose-50 border-rose-200">
          <CardContent className="p-6">
            <h2 className="font-display text-xl font-semibold mb-3">How to Measure</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold mb-1">Chest/Bust:</p>
                <p>Measure around the fullest part of your chest, keeping the tape horizontal.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Waist:</p>
                <p>Measure around your natural waistline, keeping the tape comfortably loose.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Hips:</p>
                <p>Measure around the fullest part of your hips, keeping the tape horizontal.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Shoulder:</p>
                <p>Measure from the base of your neck to the end of your shoulder.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong>Note:</strong> All measurements are approximate. If you're between sizes, we recommend sizing up for comfort.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SizeGuide;
